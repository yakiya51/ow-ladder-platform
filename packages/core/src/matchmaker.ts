import { OW_ROLES, OW_TEAM_COLORS, OwRole } from "@ow/core";
import { MatchQueue } from "./matchqueue";
import { PlayerDraftable, PlayerInQueue } from "./types";

export class MatchMaker {
  constructor(
    private queue: MatchQueue,
    private teamSize: number,
  ) {}

  get queueSize() {
    return this.queue.size;
  }

  enqueue(player: Omit<PlayerInQueue, "joinedQueueAt">) {
    return this.queue.add(player);
  }

  dequeue(playerId: string) {
    return this.queue.remove(playerId);
  }

  extractMatchPlayers(ratingRange: {
    from: number;
    to: number;
  }): Array<PlayerDraftable> | null {
    // Sort player pool by the time the player joined queue
    // Players that are in queue the longest come first.
    const playersInQueue = this.queue
      .getByRating(ratingRange.from, ratingRange.to)
      .sort((a, b) => a.joinedQueueAt - b.joinedQueueAt);

    // Ex. If team size is 6, there needs to be atleast 12 players in queue to create a match.
    if (playersInQueue.length < this.teamSize * OW_TEAM_COLORS.length) {
      return null;
    }

    const roleAssignments = new Map<OwRole, Array<PlayerDraftable>>();

    for (const role of OW_ROLES) {
      roleAssignments.set(role, []);
    }

    for (const player of playersInQueue) {
      // Fill role based on player's role preference
      for (const [role, playersInRole] of roleAssignments.entries()) {
        if (playersInRole.length < 4 && player.preferredRoles.includes(role)) {
          playersInRole.push({ ...player, assignedRole: role, team: null });
        }
      }

      // Check if all roles were filled
      let allRolesFilled = true;
      for (const role of OW_ROLES) {
        if (roleAssignments.get(role)!.length !== 4) {
          allRolesFilled = false;
          break;
        }
      }

      if (allRolesFilled) {
        const draftpool = Array.from(roleAssignments.values()).flat();

        for (const player of draftpool) {
          this.queue.remove(player.id);
        }

        return draftpool;
      }
    }

    return null;
  }
}
