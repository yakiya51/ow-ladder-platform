import z from "zod";
import { os } from "@orpc/server";
import { protectedRouter } from "../router";

export const matchRouter = protectedRouter.router({
  getMany: protectedRouter
    .route({ method: "GET" })
    .handler(async ({ input, context }) => {
      return { message: "HI" };
    }),
  getOne: protectedRouter
    .route({ method: "GET" })
    .input(z.object({ matchId: z.string() }))
    .handler(async ({ input, context }) => {
      return { matchId: input.matchId };
    }),
});
