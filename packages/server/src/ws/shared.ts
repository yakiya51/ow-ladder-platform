import z from "zod";
import { OW_ROLES, OW_MAPS, Match } from "@ow/core";
import { KV } from "../db/kv";
import { Socket } from "socket.io";

export const userIdToSocketMap = new KV<Socket>();

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
  roles: z.array(z.enum(OW_ROLES)),
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
  playerId: z.string().min(1),
});

const mapVote = z.object({
  kind: z.literal("MAP_VOTE"),
  map: z.enum(OW_MAPS),
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

type QueueJoined = {
  kind: "QUEUE_JOINED";
  queuedPlayersCount: number;
};

type QueueUpdated = {
  kind: "QUEUE_UPDATED";
  queuedPlayersCount: number;
};

type QueueLeft = {
  kind: "QUEUE_LEFT";
};

type MatchUpdated = {
  kind: "MATCH_UPDATED";
  match: Match;
};

type Error = {
  kind: "ERROR";
  payload: {
    code: "BAD_INPUT" | "UNAUTHORIZED" | "UNHANDLED";
    message: string;
  };
};

export type ServerToClientMessage =
  | QueueJoined
  | QueueUpdated
  | QueueLeft
  | MatchUpdated
  | Error;
