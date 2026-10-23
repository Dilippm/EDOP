import app from "./app.js";
import  pool  from "./config/database.js";
import { env } from "./config/env.js";
import { ensureBootstrapAdmin } from "./services/bootstrapAdmin.js";

let server;

async function start() {
  try {
    await ensureBootstrapAdmin();
    server = app.listen(env.port, () => {
      console.log(`EDOP API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("EDOP API failed to start:", error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

void start();

const shutdown = (signal) => {
  console.log(`${signal} received; shutting down gracefully.`);

  if (!server) {
    void pool.end();
    return;
  }

  server.close(async (error) => {
    if (error) {
      console.error("Failed to close the HTTP server cleanly:", error);
      process.exitCode = 1;
    }

    try {
      await pool.end();
    } catch (poolError) {
      console.error("Failed to close the PostgreSQL pool cleanly:", poolError);
      process.exitCode = 1;
    }
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
