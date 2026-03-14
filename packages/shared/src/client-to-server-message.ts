import z from "zod";
import { OW_MAPS, OW_ROLES } from "./constants";

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
