import * as arctic from "arctic";
import ENV from "./env";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import { db } from "./db";
import { userTable } from "./schema";
import { Session } from "./session";

export const BNET_OAUTH_COOKIE_NAME = "BNET_OAUTH_STATE";
export const BNetOauth = new arctic.BattleNet(
  ENV.BNET_CLIENT_ID,
  ENV.BNET_CLIENT_SECRET,
  ENV.BNET_REDIRECT_URI,
);

type BattleNetUserInfo = {
  sub?: string;
  id?: string;
  battletag?: string;
  battle_tag?: string;
};

const IS_COOKIE_SECURE = new URL(ENV.BNET_REDIRECT_URI).protocol === "https:";
const SESSION_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;

export const handleBNetOauthCallback: RequestHandler = async (req, res) => {
  const state = req.query.state;
  const code = req.query.code;
  const storedState = req.cookies[BNET_OAUTH_COOKIE_NAME] as string | undefined;

  console.log({ state, code, storedState });
  res.clearCookie(BNET_OAUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: IS_COOKIE_SECURE,
    sameSite: "lax",
    path: "/api/auth/bnet",
  });

  if (!storedState || typeof state !== "string" || storedState !== state) {
    res.redirect(`${ENV.AUTH_REDIRECT_ERROR}?reason=invalid_state`);
    return;
  }

  if (typeof code !== "string") {
    res.redirect(`${ENV.AUTH_REDIRECT_ERROR}?reason=missing_code`);
    return;
  }

  try {
    const tokens = await BNetOauth.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();

    const response = await fetch("https://oauth.battle.net/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Battle.net user info.");
    }

    const profile = (await response.json()) as BattleNetUserInfo;
    const battleNetAccountId = String(profile.sub ?? profile.id ?? "");
    const battleTag = profile.battletag ?? profile.battle_tag;

    if (!battleNetAccountId || !battleTag) {
      throw new Error("Battle.net profile is missing required fields.");
    }

    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.battleNetAccountId, battleNetAccountId),
    });

    let userId = existingUser?.id;

    if (!existingUser) {
      userId = crypto.randomUUID();
      await db.insert(userTable).values({
        id: userId,
        battleNetAccountId,
        battleTag,
      });
    } else if (existingUser.battleTag !== battleTag) {
      await db
        .update(userTable)
        .set({ battleTag })
        .where(eq(userTable.id, existingUser.id));
    }

    const token = await Session.createForUser(userId!);

    res.cookie(Session.COOKIE_NAME, token, {
      httpOnly: true,
      secure: IS_COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE,
    });

    res.redirect(ENV.AUTH_REDIRECT_SUCCESS);
  } catch (error) {
    console.error("Battle.net OAuth callback failed", error);
    res.redirect(`${ENV.AUTH_REDIRECT_ERROR}?reason=oauth_failed`);
  }
};
