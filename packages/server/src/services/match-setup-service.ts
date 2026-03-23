import {
  MatchCanceled,
  MatchDraft,
  MatchMaker,
  MatchPending,
  OwRole,
} from "@ow/core";
import { ServiceContext } from "./shared";
import { KV } from "../db/kv";
import { MatchQueue } from "@ow/core/src/matchqueue";

const pendingMatches = new KV<MatchPending>();
const playerIdToMatchId = new KV<string>();
const matchmaker = new MatchMaker(new MatchQueue(), 6);

export class MatchSetupService {
  static enqueue(ctx: ServiceContext, preferredRoles: Array<OwRole>) {
    matchmaker.enqueue({
      id: ctx.user.id,
      battleTag: ctx.user.battleTag,
      mmr: ctx.user.mmr,
      preferredRoles,
    });

    return matchmaker.queueSize;
  }

  static dequeue(ctx: ServiceContext) {
    matchmaker.dequeue(ctx.user.id);
    return matchmaker.queueSize;
  }

  static attemptMatchCreation(
    mmrFrom: number,
    mmrTo: number,
  ): MatchPending | null {
    const draftpool = matchmaker.extractMatchPlayers({
      from: mmrFrom,
      to: mmrTo,
    });

    if (!draftpool) return null;

    const matchId = crypto.randomUUID();
    const playerIds = draftpool.map((p) => p.id);
    const match: MatchPending = {
      id: matchId,
      state: "PENDING",
      acceptDeadline: Date.now() + 20 * 1000,
      acceptedPlayerIds: [],
      players: draftpool,
    };

    for (const playerId of playerIds) {
      if (playerIdToMatchId.has(playerId)) {
        throw new Error("Player is already in a pending match.");
      }
    }

    // Store pending match into KV store
    const expiration = 30;
    pendingMatches.set(matchId, match, expiration);

    for (const playerId of playerIds) {
      playerIdToMatchId.set(playerId, matchId, expiration);
    }

    return match;
  }

  // We don't want the user to specify the matchId for security purposes
  static acceptMatch(playerId: string): MatchDraft | MatchPending {
    const matchId = playerIdToMatchId.get(playerId);
    const match = pendingMatches.get(matchId ?? "");

    if (!match || !match.players.map((p) => p.id).includes(playerId)) {
      throw new Error("player is not part of this pending match.");
    }

    match.acceptedPlayerIds.push(playerId);

    if (match.acceptedPlayerIds.length === match.players.length) {
      pendingMatches.delete(match.id);
      return {
        id: match.id,
        players: match.players,
        state: "DRAFTING",
        draftDeadline: Date.now() + 30 * 1000,
        draftTurn: "BLUE",
      };
    } else {
      return match;
    }
  }

  static declineMatch(playerId: string): MatchCanceled {
    const matchId = playerIdToMatchId.get(playerId);
    const match = pendingMatches.get(matchId ?? "");

    if (
      !matchId ||
      !match ||
      !match.players.map((p) => p.id).includes(playerId)
    ) {
      throw new Error("player is not part of any pending matches.");
    }

    pendingMatches.delete(matchId);

    return {
      id: match.id,
      state: "CANCELED",
      reason: "DECLINED",
    };
  }
}
