import { Socket } from "socket.io";
import { MatchSetupService } from "../services/match-setup-service";
import {
  ClientToServerEvents,
  ClientToServerMessage,
  ServerToClientEvents,
  userIdToSocketMap,
} from "./shared";
import { ServiceContext } from "../services/shared";

const QUEUE_ROOM_KEY = "queue";

export const handleWsMessage = (props: {
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  message: ClientToServerMessage;
  ctx: ServiceContext;
}): void => {
  const { socket, message, ctx } = props;

  switch (message.kind) {
    case "QUEUE_JOIN": {
      socket.join(QUEUE_ROOM_KEY);
      const count = MatchSetupService.enqueue(ctx, message.roles);

      socket.emit("message", {
        kind: "QUEUE_JOINED",
        queuedPlayersCount: count,
      });

      socket.broadcast.to(QUEUE_ROOM_KEY).emit("message", {
        kind: "QUEUE_UPDATED",
        queuedPlayersCount: count,
      });

      const match = MatchSetupService.attemptMatchCreation(0, 5000);

      if (!match) return;

      const userIds = match.players.map((p) => p.id);

      for (const userId of userIds) {
        const socket = userIdToSocketMap.get(userId);
        if (socket) {
          socket.leave("queue");
          socket.join(match.id);
        }
      }

      socket.to(match.id).emit("message", { kind: "MATCH_UPDATED", match });
      break;
    }
    case "QUEUE_LEAVE": {
      const count = MatchSetupService.dequeue(ctx);

      socket.broadcast.to(QUEUE_ROOM_KEY).emit("message", {
        kind: "QUEUE_UPDATED",
        queuedPlayersCount: count,
      });

      socket.disconnect();
      break;
    }
    case "MATCH_ACCEPT": {
      const match = MatchSetupService.acceptMatch(ctx.user.id);
      socket.to(match.id).emit("message", { kind: "MATCH_UPDATED", match });
      break;
    }
    case "MATCH_DECLINE": {
      const match = MatchSetupService.declineMatch(ctx.user.id);
      socket.to(match.id).emit("message", { kind: "MATCH_UPDATED", match });
      break;
    }
    case "DRAFT_PICK_PLAYER":
      break;
    case "MAP_VOTE":
      break;
  }
};
