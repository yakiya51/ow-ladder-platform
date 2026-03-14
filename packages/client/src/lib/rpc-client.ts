import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type RouterClient } from "@orpc/server";
import type { RpcRouter } from "@ow/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const link = new RPCLink({
  url: `http://${import.meta.env.PUBLIC_SERVER_HOST}:${import.meta.env.PUBLIC_SERVER_PORT}/api`,
  fetch: (request, init) =>
    fetch(request, {
      ...init,
      credentials: "include",
    }),
  headers: () => ({
    authorization: "Bearer token",
  }),
  interceptors: [
    onError((error) => {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error(error);
    }),
  ],
});

// Create a client for your router
const client: RouterClient<RpcRouter> = createORPCClient(link);
export const rpc = createTanstackQueryUtils(client);
