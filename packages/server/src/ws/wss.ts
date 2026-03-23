import http from "http";
import { parse } from "cookie";
import { DefaultEventsMap, Server } from "socket.io";
import { Session, SessionContext } from "../session";
import { MatchSetupService } from "../services/match-setup-service";
import {
  ClientToServerEvents,
  clientToServerMessageValidator,
  ServerToClientEvents,
  userIdToSocketMap,
} from "./shared";
import { handleWsMessage } from "./handlers";
import { ServiceContext } from "../services/shared";
import { db } from "../db/connection";

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

    if (!session) {
      return next(new Error("Unauthorized"));
    }

    socket.data.session = session;

    next();
  });

  io.on("connection", (socket) => {
    console.log("Websocket Connected:", socket.id);

    const session = socket.data.session;
    userIdToSocketMap.set(session.userId, socket);

    const ctx: ServiceContext = {
      db: db,
      user: {
        id: session.userId,
        battleTag: session.battleTag,
        mmr: session.mmr,
      },
    };

    // Join `userId` room so we can broadcast messages
    // via. userId later on (not just on socketId);
    socket.join(session.userId);

    socket.on("disconnect", () => {
      console.log("Websocket Disconnected:", socket.id);
      userIdToSocketMap.delete(session.userId);
      // in case user was in queue
      MatchSetupService.dequeue(ctx);
    });

    socket.on("message", async (rawMsg) => {
      const res = clientToServerMessageValidator.safeParse(rawMsg);

      if (!res.success) {
        socket.emit("message", {
          kind: "ERROR",
          payload: {
            code: "BAD_INPUT",
            message: "Invalid message.",
          },
        });
        return;
      }

      handleWsMessage({
        socket,
        message: res.data,
        ctx,
      });
    });
  });

  return io;
}
