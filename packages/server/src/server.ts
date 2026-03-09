import http from "http";
import { api } from "./api";
import { wss } from "./ws/wss";
import ENV from "./env";

const server = http.createServer(api);

server.on("upgrade", (req, socket, head) => {
  if (!req.url?.startsWith("/ws")) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

server.on("error", (e) => {
  console.log(e);
});

server.listen(ENV.PUBLIC_SERVER_PORT, ENV.PUBLIC_SERVER_HOST, () =>
  console.log(
    `Server started on http://${ENV.PUBLIC_SERVER_HOST}:${ENV.PUBLIC_SERVER_PORT}`,
  ),
);
