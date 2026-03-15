import { OwRole } from "@ow/shared";

export type QueuedPlayer = {
  userId: string;
  battleTag: string;
  roles: Array<OwRole>;
  mmr: number;
  joinedQueueAt: Date;
};

export interface MatchQueue {
  add(entry: Omit<QueuedPlayer, "joinedQueueAt">): { playersInQueue: number };
  remove(entryId: string): void;
  getAll(): Array<QueuedPlayer>;
  getByRating(range: { from: number; to: number }): Array<QueuedPlayer>;
}

// Not expecting many users in queue at this point so we're just using a array.
// Could use something like a sorted set as an optimization in the future.
export class SimpleMatchQueue implements MatchQueue {
  private queue = [] as Array<QueuedPlayer>;

  add(entry: Omit<QueuedPlayer, "joinedQueueAt">) {
    this.queue.push({ ...entry, joinedQueueAt: new Date() });
    return { playersInQueue: this.queue.length };
  }

  remove(entryId: string) {
    this.queue = this.queue.filter((entry) => entry.userId !== entryId);
  }

  getAll() {
    return this.queue;
  }

  getByRating(range: { from: number; to: number }) {
    return this.queue.filter(
      (entry) => entry.mmr >= range.from && entry.mmr <= range.to,
    );
  }
}
