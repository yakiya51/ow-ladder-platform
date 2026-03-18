import { Socket } from "socket.io";
import { MatchSetupService } from "../services/match-setup-service";
import {
  ClientToServerEvents,
  ClientToServerMessage,
  ServerToClientEvents,
} from "./shared";

type Context = {
  userId: string;
  battleTag: string;
  mmr: number;
};

const QUEUE_ROOM_KEY = "queue";

export const wsMessageHandlers: {
  [K in ClientToServerMessage["kind"]]: (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    data: Extract<ClientToServerMessage, { kind: K }>,
    ctx: Context,
  ) => void;
} = {
  QUEUE_JOIN: async (socket, data, session) => {
    socket.join(QUEUE_ROOM_KEY);
    const count = await MatchSetupService.joinQueue(ctx, msg.payload.roles);

    // Send joined message to the user who joined the queue
    socket.to(socket.id).emit("message", {
      kind: "QUEUE_JOINED",
      payload: { queuedPlayersCount: count },
    });

    // Broadcast updated queue information to all clients
    // besides the client that joined
    socket.broadcast.to(QUEUE_ROOM_KEY).emit("message", {
      kind: "QUEUE_UPDATED",
      payload: { queuedPlayersCount: count },
    });

    // TODO(yakiya): set proper MMR range
    const match = MatchMakerService.makeMatch(-Infinity, Infinity);

    if (!match) return;

    const playerIds = match.players.map((p) => p.userId);

    // Send MATCH_FOUND to all players in the match
    socket
      .to("queue")
      .to(playerIds)
      .emit("message", {
        kind: "MATCH_FOUND",
        payload: {
          matchId: crypto.randomUUID(),
          acceptDeadline: new Date().toString(),
        },
      });

    PendingMatchService.create(match.id, playerIds);
  },
  QUEUE_LEAVE: (socket) => {
    const count = MatchQueueService.leave(ctx);

    socket.broadcast.to(QUEUE_ROOM_KEY).emit("message", {
      kind: "QUEUE_UPDATED",
      payload: { queuedPlayersCount: count },
    });

    socket.disconnect();
  },
  MATCH_ACCEPT: (socket) => {
    const match = PendingMatchService.getMatchByPlayerId(ctx.user.id);

    if (!match) {
      socket.to(socket.id).emit("message", {
        kind: "ERROR",
        payload: {
          code: "BAD_INPUT",
          message: "You are not in a pending match.",
        },
      });
      return;
    }

    const state = PendingMatchService.accept(match.id, ctx.user.id);

    if (state.status === "ALL_ACCEPTED") {
    }
  },
};
