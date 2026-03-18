import { KV } from "@ow/kv";
import { OW_ROLES, OwRole } from "@ow/core";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema";
import { ServiceContext } from "./shared";
import { MatchState } from "../features/matchmaker";

type PendingMatch = {
  id: string;
  playerIds: Array<string>;
  acceptedPlayerIds: Array<string>;
};

type QueuedPlayer = {
  userId: string;
  battleTag: string;
  mmr: number;
  roles: Array<OwRole>;
  joinedAt: number;
};

const matchQueue = new KV<QueuedPlayer>();
const pendingMatches = new KV<PendingMatch>();
const playerIdToMatchId = new KV<string>();

export class MatchSetupService {
  static async joinQueue(ctx: ServiceContext, roles: Array<OwRole>) {
    const { db, user } = ctx;

    const player = await db.query.userTable.findFirst({
      where: eq(userTable.id, user.id),
    });

    if (!player) {
      throw new Error("session user does not exist in user table.");
    }

    matchQueue.set(player.id, {
      userId: player.id,
      battleTag: player.battleTag,
      mmr: player.mmr,
      roles: roles,
      joinedAt: Date.now(),
    });

    return matchQueue.size();
  }

  static leaveQueue(ctx: ServiceContext) {
    matchQueue.delete(ctx.user.id);
    return matchQueue.size();
  }

  static createPendingMatch(matchId: string, playerIds: Array<string>) {
    // 1. store pre-match info in in-memory database
    // 2. keep applying events onto the state.
    // 3. once actual match is created, store into persistent database

    pendingMatches.set(matchId, {
      id: matchId,
      playerIds: playerIds,
      acceptedPlayerIds: [],
    });

    for (const playerId of playerIds) {
      if (playerIdToMatchId.has(playerId)) {
        throw new Error("Player is already in a pending match.");
      }
      playerIdToMatchId.set(playerId, matchId);
    }
  }

  // We don't want the user to specify the matchId for security purposes
  static acceptMatch(matchId: string, playerId: string) {
    const match = pendingMatches.get(matchId);

    if (!match || !match.playerIds.includes(playerId)) {
      throw new Error("player is not part of this pending match.");
    }

    match.acceptedPlayerIds.push(playerId);

    if (match.acceptedPlayerIds.length === match.playerIds.length) {
      pendingMatches.delete(matchId);
      return { status: "ALL_ACCEPTED" };
    }

    return {
      status: "SOME_ACCEPTED",
      acceptedPlayerIds: match.acceptedPlayerIds,
    };
  }

  static declineMatch(playerId: string) {
    const matchId = playerIdToMatchId.get(playerId);

    if (!matchId) {
      return false;
    }
    const match = pendingMatches.get(matchId);

    if (!match || !match.playerIds.includes(playerId)) {
      return false;
    }

    return pendingMatches.delete(matchId);
  }
}
