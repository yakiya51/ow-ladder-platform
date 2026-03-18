import { OwMap, OwTeamColor } from "./overwatch";

type MatchAccepted = {
  kind: "MATCH_ACCEPTED";
  playerId: string;
  matchId: string;
};

type MatchDeclined = {
  kind: "MATCH_DECLINED";
  playerId: string;
  matchId: string;
};

type MapVoted = {
  kind: "MAP_VOTED";
  playerId: string;
  matchId: string;
  map: OwMap;
};

type PlayerDrafted = {
  kind: "PLAYER_DRAFTED";
  captainId: string;
  team: OwTeamColor;
  matchId: string;
  chosenPlayerId: string;
};

export type CoreEvent =
  | MatchAccepted
  | MatchDeclined
  | MapVoted
  | PlayerDrafted;
