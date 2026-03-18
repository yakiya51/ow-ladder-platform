import { matchResultRouter } from "./match-result";
import { authRouter } from "./auth";
import { baseRoute } from "./shared";
import { RPCHandler } from "@orpc/server/node";
import { onError } from "@orpc/server";
import {
  RequestHeadersPlugin,
  ResponseHeadersPlugin,
} from "@orpc/server/plugins";

const router = baseRoute.router({
  matches: matchResultRouter,
  auth: authRouter,
});

export const orpcHandler = new RPCHandler(router, {
  plugins: [new RequestHeadersPlugin(), new ResponseHeadersPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export type RpcRouter = typeof router;
