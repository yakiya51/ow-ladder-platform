import http from "http";
import { api } from "./api";
import { createSocketServer } from "./ws/server";
import ENV from "./env";

const server = http.createServer(api);

createSocketServer(server);

server.on("error", (e) => console.log(e));

server.listen(ENV.PUBLIC_SERVER_PORT, ENV.PUBLIC_SERVER_HOST, () =>
  console.log(
    `Server started on http://${ENV.PUBLIC_SERVER_HOST}:${ENV.PUBLIC_SERVER_PORT}`,
  ),
);
