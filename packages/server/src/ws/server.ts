import http from "http";
import { parse } from "cookie";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import { Session, SessionContext } from "../session";
import { clientToServerMsgValidator, ServerToClientMsg } from "@ow/shared";
import { db } from "../db";
import { handleMessageFromClient } from "./message-handler";
import { emit } from "./util";

export function createSocketServer(httpServer: http.Server) {
  const io = new Server<
    DefaultEventsMap,
    DefaultEventsMap,
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
    console.log("[WS] Connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("[WS] Disconnected:", socket.id);
    });

    socket.on("message", async (data) => {
      const res = clientToServerMsgValidator.safeParse(data);

      if (res.success) {
        const session = socket.data.session;
        await handleMessageFromClient(socket, res.data, {
          db,
          user: {
            battleTag: session.battleTag,
            id: session.userId,
          },
        });
      } else {
        emit(socket, {
          kind: "ERROR",
          payload: { code: "BAD_INPUT", message: "Received invalid message." },
        });
      }
    });
  });

  return io;
}
