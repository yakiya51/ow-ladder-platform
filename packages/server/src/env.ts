import { z } from "zod";

const schema = z.object({
  PUBLIC_SERVER_HOST: z.string().min(1),
  PUBLIC_SERVER_PORT: z.coerce.number().min(1),

  DB_SCHEMA: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),

  ENABLE_DB_LOGS: z.stringbool(),
  ENABLE_API_LOG: z.stringbool(),
});

const { error, data: ENV } = schema.safeParse(process.env);

if (error) {
  throw new Error("Invalid .env file: " + z.prettifyError(error));
}

export default ENV!;
