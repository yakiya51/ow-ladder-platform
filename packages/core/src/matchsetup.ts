import { Match, PlayerDraftable, PlayerDrafted } from "./types";
import { CoreEvent } from "./commands";
import { OW_MAPS, OW_TEAM_COLORS, OwMap } from "./overwatch";
import { rand, rands } from "./util";

type Error =
  | "PLAYER_DOES_NOT_EXIST"
  | "NOT_CAPTAIN"
  | "NOT_YOUR_TURN"
  | "PLAYER_NOT_IN_MATCH"
  | "PLAYER_ALREADY_DRAFTED"
  | "INVALID_MAP"
  | "INVALID_EVENT";

export function appleEventToMatch(
  match: Match,
  event: CoreEvent,
): { ok: true; match: Match } | { ok: false; error: Error } {
  switch (match.state) {
    case "PENDING": {
      if (event.kind === "MATCH_ACCEPTED") {
        match.acceptedPlayerIds.push(event.playerId);

        // All accepted
        if (match.acceptedPlayerIds.length === match.players.length) {
          const players = [...match.players];

          const playersWithCaptains = [] as Array<
            PlayerDraftable | PlayerDrafted
          >;

          // Randomly select captain for each team.
          // There will be one less player for each iteration, so subtract i from the max index to avoid out of bounds error.
          for (let i = 0; i < OW_TEAM_COLORS.length; i++) {
            const team = OW_TEAM_COLORS[i]!;

            const random = rand(0, match.players.length - 1 - i);
            const captain = players.splice(random, 1)[0]!;
            playersWithCaptains.push({ ...captain, team, isCaptain: true });
          }

          // Add remaining players
          playersWithCaptains.push(...players);

          // TODO(yakiya): Is draft turn ok to hard code as blue?
          // TODO(yakiya): Adjust draft deadline if necessary
          return {
            ok: true,
            match: {
              id: match.id,
              state: "DRAFTING",
              players: playersWithCaptains,
              draftTurn: "BLUE",
              draftDeadline: Date.now() + 20 * 1000,
            },
          };
        }

        // Keep in same status because not all players have accepted the match.
        // acceptedPlayerIds has already been updated in the beginning of this scope.
        return { ok: true, match };
      } else if (event.kind === "MATCH_DECLINED") {
        return {
          ok: true,
          match: {
            id: match.id,
            state: "CANCELED",
            reason: "DECLINED",
          },
        };
      } else {
        return { ok: false, error: "INVALID_EVENT" };
      }
    }
    case "DRAFTING": {
      if (event.kind === "PLAYER_DRAFTED") {
        const captain = match.players.find(
          (player) => player.id === captain.id,
        ) as PlayerDraftable | PlayerDrafted;

        if (!captain) {
          return { ok: false, error: "PLAYER_DOES_NOT_EXIST" };
        }

        if (captain.team === null || !captain.isCaptain) {
          return { ok: false, error: "NOT_CAPTAIN" };
        }

        if (captain.team !== match.draftTurn) {
          return { ok: false, error: "NOT_YOUR_TURN" };
        }

        const draftedPlayer = match.players.find(
          (player) => player.id === event.chosenPlayerId,
        );

        if (!draftedPlayer) {
          return { ok: false, error: "PLAYER_NOT_IN_MATCH" };
        }

        if (draftedPlayer.team !== null) {
          return { ok: false, error: "PLAYER_ALREADY_DRAFTED" };
        }

        const allDrafted = match.players.every(
          (player) => player.team !== null,
        );

        if (allDrafted) {
          const mapIdxs = rands(5, 0, OW_MAPS.length - 1);
          const mapPool = [] as Array<OwMap>;

          for (const idx of mapIdxs) {
            mapPool.push(OW_MAPS[idx]!);
          }

          return {
            ok: true,
            match: {
              id: match.id,
              state: "MAP_VOTE",
              players: match.players as Array<PlayerDrafted>,
              mapPool,
              votes: {},
              voteDeadline: Date.now() + 20 * 1000,
            },
          };
        } else {
          // NOTE(yakiya): I think it's ok to assume there will only ever be a BLUE and RED team
          return {
            ok: true,
            match: {
              id: match.id,
              state: "DRAFTING",
              players: match.players,
              draftDeadline: match.draftDeadline,
              draftTurn: match.draftTurn === "BLUE" ? "RED" : "BLUE",
            },
          };
        }
      } else {
        return { ok: false, error: "INVALID_EVENT" };
      }
    }
    case "MAP_VOTE": {
      if (event.kind === "MAP_VOTED") {
        if (!match.mapPool.includes(event.map)) {
          return { ok: false, error: "INVALID_MAP" };
        }

        return {
          ok: true,
          match: {
            id: match.id,
            state: "MAP_VOTE",
            mapPool: match.mapPool,
            players: match.players,
            votes: { ...match.votes, [event.playerId]: event.map },
            voteDeadline: match.voteDeadline,
          },
        };
      } else {
        return { ok: false, error: "INVALID_EVENT" };
      }
    }
    case "CANCELED":
    case "IN_PROGRESS":
    case "COMPLETED":
      return { ok: false, error: "INVALID_EVENT" };
  }
}
