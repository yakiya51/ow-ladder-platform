import { ServerToClientMsg } from "@ow/shared";
import { Socket } from "socket.io";

// Just a wrapper for type-safety
export function emit(socket: Socket, msg: ServerToClientMsg) {
  return socket.emit("message", msg);
}
