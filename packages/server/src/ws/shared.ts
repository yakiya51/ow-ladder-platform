import z from "zod";
import {
  OW_ROLES,
  OW_MAPS,
  OwMap,
  PlayerDraftable,
  PlayerDrafted,
} from "@ow/core";

export type ClientToServerEvents = {
  message: (msg: ClientToServerMessage) => void;
};

export type ServerToClientEvents = {
  message: (msg: ServerToClientMessage) => void;
};

//
// Client messages need to be validated at runtime so we are defining each of their zod schemas first
//
const queueJoin = z.object({
  kind: z.literal("QUEUE_JOIN"),
  payload: z.object({ roles: z.array(z.enum(OW_ROLES)) }),
});

const queueLeave = z.object({
  kind: z.literal("QUEUE_LEAVE"),
});

const matchAccept = z.object({
  kind: z.literal("MATCH_ACCEPT"),
});

const matchDecline = z.object({
  kind: z.literal("MATCH_DECLINE"),
});

const draftPickPlayer = z.object({
  kind: z.literal("DRAFT_PICK_PLAYER"),
  payload: z.object({ playerId: z.string().min(1) }),
});

const mapVote = z.object({
  kind: z.literal("MAP_VOTE"),
  payload: z.object({ map: z.enum(OW_MAPS) }),
});

export const clientToServerMessageValidator = z.discriminatedUnion("kind", [
  queueJoin,
  queueLeave,
  matchAccept,
  matchDecline,
  draftPickPlayer,
  mapVote,
]);

export type ClientToServerMessage = z.infer<
  typeof clientToServerMessageValidator
>;
//
// Only validating server to client messages during compile type
//

export type Message<
  K extends string,
  P extends object | undefined = undefined,
> = {
  kind: K;
} & (P extends undefined ? {} : { payload: P });

type QueueJoined = Message<"QUEUE_JOINED", { queuedPlayersCount: number }>;

type QueueUpdated = Message<"QUEUE_UPDATED", { queuedPlayersCount: number }>;

type QueueLeft = Message<"QUEUE_LEFT">;

type MatchFound = Message<
  "MATCH_FOUND",
  { matchId: string; acceptDeadline: string }
>;

type MatchCanceled = Message<"MATCH_CANCELLED", { matchId: string }>;

// Hero select phase begins
type DraftStarted = Message<
  "DRAFT_STARTED",
  {
    matchId: string;
    pickDeadline: string;
    players: Array<PlayerDraftable | PlayerDrafted>;
  }
>;

type DraftUpdated = Message<
  "DRAFT_UPDATED",
  { players: Array<PlayerDraftable | PlayerDrafted> }
>;

type DraftCompleted = Message<
  "DRAFT_COMPLETED",
  {
    players: Array<PlayerDrafted>;
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

type MapVoteCompleted = Message<"MAP_VOTE_COMPLETED", { map: OwMap }>;

type Error = Message<
  "ERROR",
  { code: "BAD_INPUT" | "UNAUTHORIZED" | "UNHANDLED"; message: string }
>;

export type ServerToClientMessage =
  | QueueJoined
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
