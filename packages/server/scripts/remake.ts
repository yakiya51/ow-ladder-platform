import mysql from "mysql2/promise";
import { rm } from "fs/promises";
import ENV from "../src/env";

async function resetDb() {
  const connection = await mysql.createConnection({
    host: ENV.DB_HOST,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  });

  await connection.execute(`DROP DATABASE IF EXISTS \`${ENV.DB_SCHEMA}\`;`);
  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS \`${ENV.DB_SCHEMA}\`;`,
  );
  try {
    await rm("drizzle", { recursive: true, force: true });
  } catch (e) {
    console.log("The directory `drizzle` does not exist.");
  } finally {
    connection.destroy();
  }
}

resetDb()
  .then(() => {
    console.log("database is reset");
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
