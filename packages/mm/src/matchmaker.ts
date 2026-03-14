import {
  MatchState,
  MatchTeam,
  OW_ROLES,
  OW_TEAM_COLORS,
  OwRole,
  randIntInclusive,
} from "@ow/shared";
import { MatchQueue, Player } from "./queue";

export class MatchMaker {
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

    const roleAssignments: Map<OwRole, Array<Player>> = new Map();

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
        const captainIds = [];

        for (const team of OW_TEAM_COLORS) {
          const random = randIntInclusive(0, allPlayers.length - 1);
          teams.push({ team, players: [{}] });
        }

        const captain = [];
        return {
          id: crypto.randomUUID(),
          status: "DRAFT",
          draftablePlayers: [],
          teams: [{ team: "RED" }],
        };
      }
    }

    return null;
  }
}
