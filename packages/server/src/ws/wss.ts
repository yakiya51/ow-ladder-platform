import http from "http";
import { parse } from "cookie";
import { DefaultEventsMap, Server } from "socket.io";
import { Session, SessionContext } from "../session";
import { MatchSetupService } from "../services/match-setup-service";
import {
  ClientToServerEvents,
  clientToServerMessageValidator,
  ServerToClientEvents,
} from "./shared";
import { wsMessageHandlers } from "./handlers";

export function createWebSocketServer(httpServer: http.Server) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    { session: SessionContext }
  >(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.use(async (socket, next) => {
    const cookies = parse(socket.handshake.headers.cookie ?? "");
    const session = await Session.validate(cookies[Session.COOKIE_NAME] ?? "");
    if (!session) return next(new Error("Unauthorized"));
    socket.data.session = session;
    next();
  });

  io.on("connection", (socket) => {
    console.log("Websocket Connected:", socket.id);

    const session = socket.data.session;

    const ctx = {
      userId: session.userId,
      battleTag: session.battleTag,
      mmr: session.mmr,
    };

    // Join `userId` room so we can broadcast messages
    // via. userId later on (not just on socketId);
    socket.join(session.userId);

    socket.on("disconnect", () => {
      console.log("Websocket Disconnected:", socket.id);

      // in case user was in queue
      MatchSetupService.leaveQueue(ctx);
    });

    socket.on("message", async (rawMsg) => {
      const res = clientToServerMessageValidator.safeParse(rawMsg);

      if (!res.success) {
        socket.emit("message", {
          kind: "ERROR",
          payload: { code: "BAD_INPUT", message: "Invalid message type." },
        });
        return;
      }

      const msg = res.data;

      switch (msg.kind) {
        case "QUEUE_JOIN":
          wsMessageHandlers.QUEUE_JOIN(socket, msg, ctx);
          break;
        case "QUEUE_LEAVE":
          wsMessageHandlers.QUEUE_LEAVE(socket, msg, ctx);
          break;
        case "MATCH_ACCEPT":
          wsMessageHandlers.MATCH_ACCEPT(socket, msg, ctx);
          break;
        case "MATCH_DECLINE":
          wsMessageHandlers.MATCH_DECLINE(socket, msg, ctx);
          break;
        case "DRAFT_PICK_PLAYER":
          wsMessageHandlers.DRAFT_PICK_PLAYER(socket, msg, ctx);
          break;
        case "MAP_VOTE":
          wsMessageHandlers.MAP_VOTE(socket, msg, ctx);
          break;
        default:
          throw new Error("received invalid message kind");
      }
    });
  });

  return io;
}
