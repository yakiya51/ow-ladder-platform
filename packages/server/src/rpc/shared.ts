import { ORPCError, os } from "@orpc/server";
import { Session } from "../session";
import {
  RequestHeadersPluginContext,
  ResponseHeadersPluginContext,
} from "@orpc/server/plugins";
import { getCookie } from "@orpc/server/helpers";

type BaseRpcContext = RequestHeadersPluginContext &
  ResponseHeadersPluginContext;

export const baseRoute = os.$context<BaseRpcContext>();
export const publicRoute = baseRoute;

export const authMiddleware = baseRoute.middleware(
  async ({ context, next }) => {
    const token = getCookie(context.reqHeaders, Session.COOKIE_NAME);

    const session = token ? await Session.validate(token) : null;

    if (!session) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: { session },
    });
  },
);

export const protectedRoute = baseRoute.use(authMiddleware);
