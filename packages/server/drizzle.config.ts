import { defineConfig } from "drizzle-kit";
import ENV from "./src/env";

export default defineConfig({
  schema: "./src/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_SCHEMA,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  },
});
