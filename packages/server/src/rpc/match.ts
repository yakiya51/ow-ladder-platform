import z from "zod";
import { protectedRoute } from "./shared";

export const matchRouter = {
  getMany: protectedRoute
    .route({ method: "GET" })
    .handler(async ({ input, context }) => {
      return { message: "HI" };
    }),
  getOne: protectedRoute
    .route({ method: "GET" })
    .input(z.object({ matchId: z.string() }))
    .handler(async ({ input, context }) => {
      return { matchId: input.matchId };
    }),
};
