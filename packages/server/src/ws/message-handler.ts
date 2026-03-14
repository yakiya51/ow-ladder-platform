import { ClientToServerMsg } from "@ow/shared";
import { ServiceContext, invoke } from "../service";
import { MatchMakingService } from "../services/matchmaking";
import { Socket } from "socket.io";
import { emit } from "./util";

export async function handleMessageFromClient(
  socket: Socket,
  message: ClientToServerMsg,
  ctx: ServiceContext,
) {
  switch (message.kind) {
    case "QUEUE_JOIN":
      {
        const { playersInQueue } = await invoke(
          MatchMakingService,
          (s) => s.joinQueue(message.payload.roles),
          ctx,
        );

        emit(socket, { kind: "QUEUE_JOINED", payload: { playersInQueue } });
      }
      break;
    case "QUEUE_LEAVE":
      {
        emit(socket, { kind: "QUEUE_LEFT" });
      }
      break;
    case "MATCH_ACCEPT":
      {
        emit(socket, { kind: "DRAFT_STARTED", payload: {} });
      }
      break;
    case "DRAFT_PICK_PLAYER":
      {
        emit(socket, { kind: "DRAFT_UPDATED", payload: {} });
      }
      break;
  }
}
