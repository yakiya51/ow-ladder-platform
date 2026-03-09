import { MatchPlayer, MatchTeam, OwMap, OwRole, OwTeamColor } from "./types";

type Message<K extends string, P extends object = never> = {
  kind: K;
  payload: P;
};

export type ServerMessage =
  | QueueUpdated
  | QueueLeft
  | MatchFound
  | MatchCanceled
  | DraftStarted
  | DraftUpdated
  | DraftCompleted
  | MapVoteStarted
  | MapVoteUpdated
  | MapVoteCompleted
  | Error;

type QueueUpdated = Message<
  "QUEUE_UPDATED",
  {
    status: "WAITING";
    estimatedWaitSeconds: number;
    playersInQueue: number;
  }
>;

type QueueLeft = Message<"QUEUE_LEFT">;

type MatchFound = Message<
  "MATCH_FOUND",
  {
    matchId: string;
    acceptDeadline: string;
    avatarUrl: string;
    sr: number;
  }
>;

interface MatchCanceled {
  type: "MATCH_CANCELLED";
  payload: {
    matchId: string;
    reason: string;
  };
}

// Hero select phase begins
type DraftStarted = Message<
  "DRAFT_STARTED",
  {
    matchId: string;
    pickDeadlineSeconds: number;
    teams: MatchTeam;
    draftablePlayers: Array<MatchPlayer>;
  }
>;

type DraftUpdated = Message<
  "PLAYER_DRAFTED",
  {
    teams: Array<MatchTeam>;
    draftablePlayers: Array<MatchPlayer>;
  }
>;

type DraftCompleted = Message<
  "DRAFT_COMPLETED",
  {
    teams: Array<MatchTeam>;
  }
>;

type MapVoteStarted = Message<
  "MAP_VOTE_STARTED",
  {
    choices: Array<OwMap>;
    voteDeadline: string;
  }
>;

type MapVoteUpdated = Message<
  "MAP_VOTE_UPDATED",
  {
    votes: Array<{
      mapId: OwMap;
      count: string;
    }>;
  }
>;

type MapVoteCompleted = Message<
  "MAP_VOTE_COMPELTED",
  {
    map: OwMap;
  }
>;

type Error = Message<
  "ERROR",
  {
    code:
      | "ALREADY_IN_QUEUE"
      | "MATCH_EXPIRED"
      | "INVALID_HERO"
      | "NOT_YOUR_TURN";
    message: string;
  }
>;

export type ClientMessage =
  | QueueJoin
  | QueueLeave
  | MatchAccept
  | MatchDecline
  | DraftPickPlayer
  | MapVote;

type QueueJoin = Message<"QUEUE_JOIN", { roles: Array<OwRole> }>;

type QueueLeave = Message<"QUEUE_LEAVE">;

type MatchAccept = Message<
  "MATCH_ACCEPT",
  {
    matchId: string;
  }
>;
type MatchDecline = Message<
  "MATCH_DECLINE",
  {
    matchId: string;
  }
>;

type DraftPickPlayer = Message<
  "DRAFT_PICK_PLAYER",
  {
    playerId: string;
  }
>;

type MapVote = Message<"MAP_VOTE", { map: OwMap }>;
