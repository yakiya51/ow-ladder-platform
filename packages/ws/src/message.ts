import z from "zod";
import { OW_MAPS, OW_ROLES, OwMap } from "@ow/shared";
import { MatchTeam, MatchPlayer } from "@ow/mm";

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

export const clientToServerMsgValidator = z.discriminatedUnion("kind", [
  queueJoin,
  queueLeave,
  matchAccept,
  matchDecline,
  draftPickPlayer,
  mapVote,
]);

export type ClientToServerMsg = z.infer<typeof clientToServerMsgValidator>;

//
// Only validating server to client messages during compile type (only type checking)
//

export type Msg<K extends string, P extends object | undefined = undefined> = {
  kind: K;
} & (P extends undefined ? {} : { payload: P });

type QueueJoined = Msg<"QUEUE_JOINED", { playersInQueue: number }>;

type QueueUpdated = Msg<"QUEUE_UPDATED", { playersInQueue: number }>;

type QueueLeft = Msg<"QUEUE_LEFT">;

type MatchFound = Msg<
  "MATCH_FOUND",
  { matchId: string; acceptDeadline: string }
>;

type MatchCanceled = Msg<"MATCH_CANCELLED", { matchId: string }>;

// Hero select phase begins
type DraftStarted = Msg<
  "DRAFT_STARTED",
  {
    matchId: string;
    pickDeadline: string;
    teams: Array<MatchTeam>;
    draftablePlayers: Array<MatchPlayer>;
  }
>;

type DraftUpdated = Msg<
  "DRAFT_UPDATED",
  {
    teams: Array<MatchTeam>;
    draftablePlayers: Array<MatchPlayer>;
  }
>;

type DraftCompleted = Msg<"DRAFT_COMPLETED", { teams: Array<MatchTeam> }>;

type MapVoteStarted = Msg<
  "MAP_VOTE_STARTED",
  { choices: Array<OwMap>; voteDeadline: string }
>;

type MapVoteUpdated = Msg<
  "MAP_VOTE_UPDATED",
  {
    votes: Array<{
      mapId: OwMap;
      count: string;
    }>;
  }
>;

type MapVoteCompleted = Msg<"MAP_VOTE_COMPLETED", { map: OwMap }>;

type Error = Msg<
  "ERROR",
  { code: "BAD_INPUT" | "UNAUTHORIZED" | "UNHANDLED"; message: string }
>;

export type ServerToClientMsg =
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
