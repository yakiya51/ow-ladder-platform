import { OwHero, OwMap } from "./constants";

type User = {
  id: string;
  email: string;
  battleTag: string;
};

type Team = {
  id: string;
  name: string;
  players: Array<User>;
};

type Match = {
  id: string;
  map: OwMap;
  blueTeam: Team;
  redTeam: Team;
  bannedHeroes: Array<OwHero>;
};
