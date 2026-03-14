import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { addDays, isAfter } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { sessionTable } from "./schema";

export type SessionContext = {
  userId: string;
  sessionId: string;
  battleTag: string;
};

export const Session = {
  COOKIE_NAME: "SESSION_ID",
  generateToken: () => {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  },
  createForUser: async (userId: string): Promise<string> => {
    const token = Session.generateToken();

    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    );
    await db.insert(sessionTable).values({
      id: sessionId,
      userId,
      expiresAt: addDays(new Date(), 30),
    });
    return token;
  },
  deleteById: async (sessionId: string) => {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
  },
  revokeByToken: async (token: string) => {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    );

    await Session.deleteById(sessionId);
  },
  validate: async (token: string): Promise<SessionContext | null> => {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    );

    // Might be worth optimizing this query if app is loading slow
    const existingSession = await db.query.sessionTable.findFirst({
      with: {
        user: {
          columns: {
            id: true,
            battleTag: true,
          },
        },
      },
      where: eq(sessionTable.id, sessionId),
      orderBy: desc(sessionTable.expiresAt),
    });

    if (!existingSession) {
      return null;
    }

    const { user, ...session } = existingSession;
    const now = new Date();

    if (isAfter(now, session.expiresAt)) {
      await Session.deleteById(session.id);
      return null;
    }

    return {
      userId: user.id,
      sessionId: session.id,
      battleTag: user.battleTag,
    };
  },
};
