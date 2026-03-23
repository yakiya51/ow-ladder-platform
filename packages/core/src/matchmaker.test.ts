import { assert, test as baseTest, expect } from "vitest";
import { MatchQueue } from "./matchqueue";
import { MatchMaker } from "./matchmaker";
import { PlayerQueueable } from "./types";
import { faker } from "@faker-js/faker";
import { OwRole } from "./overwatch";

const MMR_RANGE_MIN = 0;
const MMR_RANGE_MAX = 5000;
const TEAM_SIZE = 6;

function createPlayer(roles: Array<OwRole>): PlayerQueueable {
  return {
    id: crypto.randomUUID(),
    battleTag: faker.internet.username(),
    mmr: faker.number.int({ min: MMR_RANGE_MIN, max: MMR_RANGE_MAX }),
    preferredRoles: roles,
  };
}

const test = baseTest
  .extend("queue", new MatchQueue())
  .extend("matchmaker", ({ queue }) => new MatchMaker(queue, TEAM_SIZE));

test("single player can join and leave queue", ({ queue, matchmaker }) => {
  const player = createPlayer(["DAMAGE"]);

  matchmaker.enqueue(player);
  assert.isTrue(queue.size === 1);
  matchmaker.dequeue(player.id);
  assert.isTrue(queue.size === 0);
});

test("multiple players can join, be queried by rating, then leave queue", ({
  queue,
  matchmaker,
}) => {
  const players: Array<PlayerQueueable> = [
    // Blue Team
    createPlayer(["DAMAGE"]),
    createPlayer(["DAMAGE"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["TANK"]),
    createPlayer(["TANK"]),

    // Red Team
    createPlayer(["DAMAGE"]),
    createPlayer(["DAMAGE"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["TANK"]),
    createPlayer(["TANK"]),
  ];

  for (const player of players) {
    matchmaker.enqueue(player);
  }
  assert.isTrue(queue.size === players.length);

  const res = queue.getByRating(MMR_RANGE_MIN, MMR_RANGE_MAX);
  assert.isTrue(res.length === players.length);

  for (const player of players) {
    matchmaker.dequeue(player.id);
  }

  assert.isTrue(queue.size === 0);
});

test("given enough players in queue, draftpool can be created", ({
  queue,
  matchmaker,
}) => {
  const players: Array<PlayerQueueable> = [
    // Blue Team
    createPlayer(["DAMAGE"]),
    createPlayer(["DAMAGE"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["TANK"]),
    createPlayer(["TANK"]),

    // Red Team
    createPlayer(["DAMAGE"]),
    createPlayer(["DAMAGE"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["SUPPORT"]),
    createPlayer(["TANK"]),
    createPlayer(["TANK"]),
  ];

  for (const player of players) {
    matchmaker.enqueue(player);
  }

  const draftablePlayers = matchmaker.extractMatchPlayers({
    from: MMR_RANGE_MIN,
    to: MMR_RANGE_MAX,
  });

  expect.assert(draftablePlayers !== null);
  expect(draftablePlayers.length).toBe(players.length);
  expect(queue.size).toBe(0);
});
