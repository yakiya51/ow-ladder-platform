import "dotenv/config";

import mysql from "mysql2/promise";
import ENV from "../src/env";

// delete all rows from all tables
export async function truncateDb() {
  const connection = await mysql.createConnection({
    host: ENV.DB_HOST,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_SCHEMA,
  });

  // get all tables
  const results = await connection.execute({
    sql: `SELECT table_name FROM information_schema.tables where table_schema = "${ENV.DB_SCHEMA}";`,
    rowsAsArray: true,
  });

  if (!results || !Array.isArray(results) || !Array.isArray(results[0])) {
    console.log("Tables not found. Information schema query result: ", results);
    process.exit(1);
  }

  if (results[0].length === 0) {
    console.log("There are no tables to truncate");
    process.exit(0);
  }

  const tables = results[0];

  // truncate all tables
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0;");
  for (const table of tables) {
    // skip views
    if (`${table}`.endsWith("_view")) {
      continue;
    }
    await connection.execute(`TRUNCATE TABLE ${table};`);
  }
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1;");
  connection.destroy();
}

truncateDb()
  .then(() => {
    console.log("truncated tables");
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
