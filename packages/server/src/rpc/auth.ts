import z from "zod";
import { publicRoute } from "./shared";

export const authRouter = {
  login: publicRoute
    .input(z.object({ username: z.string(), password: z.string() }))
    .handler(async ({ input, context }) => {
      return { message: "HI" };
    }),
};
