
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../src/config/database.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const EDOP_MIGRATION_LOCK = 748392615;

async function migrate() {
  const migrationsDir = path.resolve(currentDir, "../migrations");
  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter((file) => /^\d+_[a-z0-9_]+\.sql$/.test(file))
    .sort();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [EDOP_MIGRATION_LOCK]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.edop_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const applied = await client.query("SELECT name FROM public.edop_migrations");
    const appliedNames = new Set(applied.rows.map(({ name }) => name));

    // Older installations may already have auth tables from the original runner,
    // which had no migration ledger. Baseline that migration rather than replaying it.
    if (!appliedNames.has("001_create_auth_schema.sql")) {
      const authTables = await client.query(`
        SELECT to_regclass('auth.users') IS NOT NULL AS users,
               to_regclass('auth.auth_identities') IS NOT NULL AS identities
      `);
      if (authTables.rows[0].users && authTables.rows[0].identities) {
        await client.query(
          "INSERT INTO public.edop_migrations (name) VALUES ($1)",
          ["001_create_auth_schema.sql"]
        );
        appliedNames.add("001_create_auth_schema.sql");
        console.log("Recorded existing authentication schema migration.");
      }
    }

    for (const name of migrationFiles) {
      if (appliedNames.has(name)) continue;
      const sql = await fs.readFile(path.join(migrationsDir, name), "utf8");
      await client.query(sql);
      await client.query(
        "INSERT INTO public.edop_migrations (name) VALUES ($1)",
        [name]
      );
      console.log(`Applied ${name}.`);
    }
    await client.query("COMMIT");
    console.log("Database migrations completed.");
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
