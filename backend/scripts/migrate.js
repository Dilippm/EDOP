
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../src/config/database.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

async function migrate() {
  const migrationPath = path.resolve(
    currentDir,
    "../migrations/001_create_auth_schema.sql"
  );

  const sql = await fs.readFile(migrationPath, "utf8");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    console.log("EDOP authentication schema migration completed.");
    console.log("Created or verified auth.users and auth.auth_identities.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(async (error) => {
  console.error("Migration runner failed:", error.message);
  await pool.end();
  process.exitCode = 1;
});
