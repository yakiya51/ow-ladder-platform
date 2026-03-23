import { OW_MAPS, OW_ROLES } from "@ow/core";
import { db } from "../src/db/connection";
import { faker } from "@faker-js/faker";
import { matchTable, playerTable, userTable } from "../src/db/schema";
import { addMinutes } from "date-fns";

type UserTable = typeof userTable.$inferInsert;
type MatchTable = typeof matchTable.$inferInsert;
type PlayerTable = typeof playerTable.$inferInsert;

export async function main() {
  function createRandomUser(): UserTable {
    return {
      id: crypto.randomUUID(),
      battleNetAccountId: crypto.randomUUID(),
      battleTag: faker.internet.username(),
      createdAt: new Date(),
      mmr: faker.number.int({ min: 0, max: 5000 }),
    };
  }

  function createRandomMatchWithPlayers(): MatchTable & {
    players: Array<PlayerTable>;
  } {
    const createdAt = new Date();
    const matchId = crypto.randomUUID();

    const players = [] as Array<PlayerTable>;

    for (let i = 0; i < 12; i++) {
      const user = users[i]!;
      players.push({
        matchId,
        userId: user.id,
        assignedRole: faker.helpers.arrayElement(OW_ROLES),
        team: i <= 5 ? "RED" : "BLUE",
        isCaptain: i === 0 || i === 6,
      });
    }

    return {
      id: matchId,
      map: faker.helpers.arrayElement(OW_MAPS),
      createdAt,
      startedAt: addMinutes(createdAt, 10),
      endedAt: addMinutes(createdAt, 30),
      players,
    };
  }

  const users = [] as Array<ReturnType<typeof createRandomUser>>;
  for (let i = 0; i < 12; i++) {
    users.push(createRandomUser());
  }

  const completedMatches = [] as Array<
    MatchTable & { players: Array<PlayerTable> }
  >;

  for (let i = 0; i < 12; i++) {
    completedMatches.push(createRandomMatchWithPlayers());
  }

  await db.insert(userTable).values(users);

  await db
    .insert(matchTable)
    .values(completedMatches.map(({ players, ...match }) => match));
  await db
    .insert(playerTable)
    .values(completedMatches.map(({ players }) => players).flat());
}

main()
  .then(() => {
    console.log("database seeded.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
