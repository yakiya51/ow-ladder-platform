import { MatchState } from "@ow/mm";
import { ServiceContext } from "../services/shared";
import { matchTable, userTable } from "../db/schema";
import { eq } from "drizzle-orm";

export class MatchRepository {
  static async create(
    ctx: ServiceContext,
    match: Extract<MatchState, { status: "DRAFT" }>,
  ) {
    const { db } = ctx;
    await db.insert(matchTable).values({ id: match.id, status: "DRAFT" });
  }

  static async get(ctx: ServiceContext, matchId: string): MatchState {
    const { db } = ctx;
    const match = await db.query.matchTable.findFirst({
      with: {
        players: {
          with: {
            user: {
              columns: {
                battleTag: true,
                id: true,
                mmr: true,
              },
            },
          },
        },
        results: true,
      },
      where: eq(matchTable.id, matchId),
    });

    switch (match.status) {
    }
  }
}
