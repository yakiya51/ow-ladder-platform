import { OwRole } from "@ow/shared";

export type Player = {
  id: string;
  roles: Array<OwRole>;
  rating: number;
  joinedQueueAt: Date;
};

export interface MatchQueue {
  add(entry: { id: string }): { playersInQueue: number };
  remove(entryId: string): void;
  getAll(): Array<Player>;
  getByRating(range: { from: number; to: number }): Array<Player>;
}

// Not expecting many users in queue at this point so we're just using a array.
// Could use something like a sorted set as an optimization in the future.
export class SimpleMatchQueue implements MatchQueue {
  private queue = [] as Array<Player>;

  add(entry: Player) {
    this.queue.push(entry);
    return { playersInQueue: this.queue.length };
  }

  remove(entryId: string) {
    this.queue = this.queue.filter((entry) => entry.id !== entryId);
  }

  getAll() {
    return this.queue;
  }

  getByRating(range: { from: number; to: number }) {
    return this.queue.filter(
      (entry) => entry.rating >= range.from && entry.rating <= range.to,
    );
  }
}
