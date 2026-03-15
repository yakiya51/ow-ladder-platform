import { OwMap, OwRole, OwTeamColor } from "@ow/shared";

export type QueueState =
  | { status: "NOT_IN_QUEUE" }
  | {
      status: "IN_QUEUE";
      queuesPlayersCount: number;
    }
  | {
      status: "MATCH_FOUND";
      matchId: string;
      acceptDeadline: string;
    };

export type MatchBase = {
  id: string;
  teams: Array<MatchTeam>;
};

export type MatchPlayer = {
  userId: string;
  battleTag: string;
  mmr: number;
  roles: Array<OwRole>;
};

export type MatchDraftPool = {
  draftablePlayers: Array<MatchPlayer>;
};

export type MatchTeam = {
  team: OwTeamColor;
  players: Array<MatchPlayer & { isCaptain: boolean }>;
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

export type MatchState =
  | ({ status: "DRAFT" } & MatchBase & MatchDraftPool)
  | ({ status: "MAP_VOTE" } & MatchBase)
  | ({ status: "IN_PROGRESS" } & MatchBase & MatchMap)
  | ({ status: "FINISHED" } & MatchBase & MatchMap & MatchResults);
