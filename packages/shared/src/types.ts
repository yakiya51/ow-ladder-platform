import { OW_HEROES, OW_MAPS, OW_ROLES, OW_TEAM_COLORS } from "./constants";

export type OwRole = (typeof OW_ROLES)[number];
export type OwTeamColor = (typeof OW_TEAM_COLORS)[number];
export type OwHero = (typeof OW_HEROES)[number];
export type OwMap = (typeof OW_MAPS)[number];

export type User = {
  id: string;
  email: string;
  battleTag: string;
  mmr: number;
};

export type Team = {
  id: string;
  name: string;
  players: Array<User>;
};

export type MatchBase = {
  id: string;
};

export type MatchPlayer = {
  userId: string;
  battleTag: string;
  mmr: number;
  roles: Array<OwRole>;
};

export type MatchTeam = {
  team: OwTeamColor;
  players: MatchPlayer & { isCaptain: boolean };
};

export type MatchDraftPool = {
  draftablePlayers: Array<MatchPlayer>;
};

export type MatchTeams = {
  teams: Array<MatchTeam>;
};

export type MatchMap = {
  map: OwMap;
};

export type MatchResults = {
  results: Array<{
    team: OwTeamColor;
    score: number;
    pushDistance: number;
  }>;
};

export type Match =
  | (MatchBase & MatchTeams & MatchDraftPool & { status: "DRAFT" })
  | (MatchBase & MatchTeams & { status: "MAP_VOTE" })
  | (MatchBase & MatchTeams & MatchMap & { status: "IN_PROGRESS" })
  | (MatchBase & MatchTeams & MatchMap & MatchResults & { status: "FINISHED" });
