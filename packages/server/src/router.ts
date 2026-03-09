import { RPCHandler } from "@orpc/server/node";
import { onError, ORPCError, os } from "@orpc/server";
import { matchRouter } from "./routers/match";
import { Session } from "./session";

const router = os.router({
  matches: matchRouter,
});

export const unprotectedRouter = os.$context<{
  cookies: Record<string, string>;
}>();

export const authMiddleware = unprotectedRouter.middleware(
  async ({ context, next }) => {
    const token = context.cookies[Session.COOKIE_NAME];
    const session = token ? await Session.validate(token) : null;

    if (!session) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: { session },
    });
  },
);

export const protectedRouter = unprotectedRouter.use(authMiddleware);

export const orpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
