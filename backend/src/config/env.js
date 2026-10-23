import "dotenv/config";

const allowedNodeEnvironments = new Set(["development", "test", "production"]);
const nodeEnv = process.env.NODE_ENV ?? "development";
const portValue = process.env.PORT ?? "5000";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
const databaseUrl = process.env.DATABASE_URL;
const adminName = process.env.ADMIN_NAME;
const adminUsername = process.env.ADMIN_USERNAME;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubCallbackUrl =process.env.GITHUB_CALLBACK_URL;

if (!allowedNodeEnvironments.has(nodeEnv)) {
  throw new Error("NODE_ENV must be development, test, or production.");
}



const port = Number(portValue);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

try {
  new URL(frontendUrl);
} catch {
  throw new Error("FRONTEND_URL must be a valid URL.");
}

if (databaseUrl) {
  let parsedDatabaseUrl;
  try {
    parsedDatabaseUrl = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL.");
  }

  if (!["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol)) {
    throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
  }
}

export const env = Object.freeze({
  nodeEnv,
  port,
  frontendUrl,
  databaseUrl,
  adminName,
  adminUsername,
  adminEmail,
  adminPassword,
  jwtSecret,
  googleClientId,
  githubClientId,
  githubClientSecret,
  googleClientSecret,
  githubCallbackUrl
});
