import { OwMap, OwRole, OwTeamColor } from "@ow/core";

interface PlayerBase {
  id: string;
  battleTag: string;
  mmr: number;
  roles: Array<OwRole>;
}

export interface PlayerInQueue extends PlayerBase {
  joinedQueueAt: number;
}

export interface MatchBase {
  id: string;
}

export interface PlayerDraftable extends PlayerBase {
  team: null;
}

export interface PlayerDrafted extends PlayerBase {
  team: OwTeamColor;
  isCaptain: boolean;
}

export interface MatchPending extends MatchBase {
  state: "PENDING";
  players: Array<PlayerDraftable>;
  acceptedPlayerIds: Array<string>;
  acceptDeadline: number;
}

export interface MatchCanceled extends MatchBase {
  state: "CANCELED";
  reason: "DECLINED" | "ERROR";
}

export interface MatchDraft extends MatchBase {
  state: "DRAFTING";
  players: Array<PlayerDraftable | PlayerDrafted>;
  draftTurn: OwTeamColor;
  draftDeadline: number;
}

export interface MatchMapVote extends MatchBase {
  state: "MAP_VOTE";
  players: Array<PlayerDrafted>;
  mapPool: Array<OwMap>;
  votes: Record<string, OwMap>;
  voteDeadline: number;
}

export interface MatchInProgress extends MatchBase {
  state: "IN_PROGRESS";
  players: Array<PlayerDrafted>;
  map: OwMap;
  startedAt: number;
}

export interface MatchResult {
  team: OwTeamColor;
  score: number;
  pushDistance: number;
}

export interface MatchCompleted extends MatchBase {
  state: "COMPLETED";
  players: Array<PlayerDrafted>;
  map: OwMap;
  results: Array<MatchResult>;
}

export type Match =
  | MatchPending
  | MatchDraft
  | MatchMapVote
  | MatchInProgress
  | MatchCompleted
  | MatchCanceled;
