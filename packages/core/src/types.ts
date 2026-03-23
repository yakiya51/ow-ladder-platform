import { OwHero, OwMap, OwRole, OwTeamColor } from "@ow/core";

export type QueueState =
  | { state: "IN_QUEUE"; playerCount: number }
  | { state: "NOT_IN_QUEUE" };

interface PlayerBase {
  id: string;
  battleTag: string;
  mmr: number;
  preferredRoles: Array<OwRole>;
}

export interface PlayerQueueable extends PlayerBase {}

export interface PlayerInQueue extends PlayerBase {
  joinedQueueAt: number;
}

export interface PlayerDraftable extends PlayerBase {
  team: null;
  assignedRole: OwRole;
}

export interface PlayerDrafted extends PlayerBase {
  assignedRole: OwRole;
  team: OwTeamColor;
  isCaptain: boolean;
}

export interface PlayerStats {
  hero: OwHero;
  playTimeSeconds: number;
  eliminations: number;
  deaths: number;
  assists: number;
  damage: number;
  finalBlows: number;
  accuracy: number;
  criticalAccuracy: number;
  healing: number;
  mitigated: number;
}

export interface MatchBase {
  id: string;
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
  players: Array<PlayerDrafted & { stats: Array<PlayerStats> }>;
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
