import {
  drizzle,
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

const connection = mysql.createPool({
  host: "host",
  user: "user",
  database: "database",
});

export const db = drizzle(connection, {
  schema,
  mode: "default",
  casing: "snake_case",
  logger: false,
});

export type Transaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
