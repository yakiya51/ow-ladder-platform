import { PlayerInQueue } from "./types";

export class MatchQueue {
  private queue = [] as Array<PlayerInQueue>;

  constructor() {}

  add(player: Omit<PlayerInQueue, "joinedQueueAt">) {
    if (this.queue.find((p) => p.id === player.id)) {
      throw new Error("player is already in queue");
    }
    this.queue.push({ ...player, joinedQueueAt: Date.now() });
    return this.queue.length;
  }

  remove(playerId: string) {
    this.queue = this.queue.filter((player) => player.id !== playerId);
    return this.queue.length;
  }

  getByRating(mmrFrom: number, mmrTo: number) {
    return this.queue.filter((p) => p.mmr >= mmrFrom && p.mmr <= mmrTo);
  }

  get size() {
    return this.queue.length;
  }
}
