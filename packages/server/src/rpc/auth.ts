import { deleteCookie, getCookie, setCookie } from "@orpc/server/helpers";
import { protectedRoute, publicRoute } from "./shared";
import { Session } from "../session";
import { BNET_OAUTH_COOKIE_NAME, BNetOauth } from "../oauth";
import * as arctic from "arctic";
import ENV from "../env";

const secure = new URL(ENV.BNET_REDIRECT_URI).protocol === "https:";

export const authRouter = {
  getCurrentSession: protectedRoute.handler(async ({ context }) => {
    return context.session;
  }),
  getBNetAuthorizationURL: publicRoute.handler(async ({ context }) => {
    const state = arctic.generateState();
    const scopes = ["openid"];
    const authorizationURL = BNetOauth.createAuthorizationURL(state, scopes);

    setCookie(context.resHeaders, BNET_OAUTH_COOKIE_NAME, state, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/api/auth/bnet",
      maxAge: 1000 * 60 * 10,
    });
    return authorizationURL.toString();
  }),
  logout: publicRoute.handler(async ({ context }) => {
    const token = getCookie(context.reqHeaders, Session.COOKIE_NAME);
    if (token) {
      await Session.revokeByToken(token);
    }

    deleteCookie(context.resHeaders, Session.COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }),
};
