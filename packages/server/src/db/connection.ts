import {
  drizzle,
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import ENV from "../env";

const connection = mysql.createPool({
  database: ENV.DB_SCHEMA,
  host: ENV.DB_HOST,
  user: ENV.DB_USERNAME,
  port: ENV.DB_PORT,
  password: ENV.DB_PASSWORD,
});

export const db = drizzle(connection, {
  schema,
  mode: "default",
  casing: "snake_case",
  logger: ENV.ENABLE_DB_LOGS,
});

export type Transaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
