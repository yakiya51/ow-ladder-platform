import { OW_ROLES, OW_TEAM_COLORS, OwRole, randIntInclusive } from "@ow/shared";
import { MatchQueue, QueuedPlayer } from "./queue";
import { MatchState, MatchTeam } from "./types";

export interface MatchMaker {
  makeMatch(ratingRange: {
    from: number;
    to: number;
  }): Extract<MatchState, { status: "DRAFT" }> | null;
}

export class SimpleMatchMaker implements MatchMaker {
  constructor(private queue: MatchQueue) {}

  makeMatch(ratingRange: {
    from: number;
    to: number;
  }): Extract<MatchState, { status: "DRAFT" }> | null {
    // sort player pool by the time the player joined queue
    // Players that are in queue the longest come first.
    const pool = this.queue
      .getByRating(ratingRange)
      .sort((a, b) => a.joinedQueueAt.getTime() - b.joinedQueueAt.getTime());

    if (pool.length < 12) {
      return null;
    }

    const roleAssignments = new Map<OwRole, Array<QueuedPlayer>>();

    for (const role of OW_ROLES) {
      roleAssignments.set(role, []);
    }

    for (const player of pool) {
      // Fill role based on player's role preference
      for (const [role, assignedPlayers] of roleAssignments.entries()) {
        if (assignedPlayers.length < 2 && player.roles.includes(role)) {
          assignedPlayers.push(player);
          break;
        }
      }

      // Check if all roles were filled
      let allRolesFilled = true;
      for (const role of OW_ROLES) {
        if (roleAssignments.get(role)!.length !== 2) {
          allRolesFilled = false;
          break;
        }
      }

      // Randomly choose captains for both teams and return match data
      if (allRolesFilled) {
        const allPlayers = Array.from(roleAssignments.values()).flat();
        const teams = [] as Array<MatchTeam>;

        for (let i = 0; i < OW_TEAM_COLORS.length; i++) {
          const team = OW_TEAM_COLORS[i]!;

          // Randomly select captain from remaining players and remove them from the pool.
          // There will be one less player for each iteration, so subtract i from the max index to avoid out of bounds error.
          const random = randIntInclusive(0, allPlayers.length - 1 - i);
          const captain = allPlayers.splice(random, 1)[0]!;
          teams.push({
            team,
            players: [{ ...captain, isCaptain: true }],
          });
        }

        return {
          id: crypto.randomUUID(),
          status: "DRAFT",
          draftablePlayers: [...allPlayers],
          teams,
        };
      }
    }

    return null;
  }
}
