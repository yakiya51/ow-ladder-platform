import http from "http";
import { api } from "./express";
import { createWebSocketServer } from "./ws/wss";
import ENV from "./env";

const server = http.createServer(api);

createWebSocketServer(server);

server.on("error", (e) => console.log(e));

server.listen(ENV.PUBLIC_SERVER_PORT, ENV.PUBLIC_SERVER_HOST, () =>
  console.log(
    `Server started on http://${ENV.PUBLIC_SERVER_HOST}:${ENV.PUBLIC_SERVER_PORT}`,
  ),
);
