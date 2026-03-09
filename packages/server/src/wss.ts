import { WebSocketServer } from "ws";

export const wss = new WebSocketServer({
  noServer: true,
});

wss.on("connection", (socket, req) => {
  socket.on("message", (data) => {
    console.log("received:", data.toString());
  });

  socket.on("close", () => console.log("disconnected"));
});
