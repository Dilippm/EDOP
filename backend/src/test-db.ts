import { prisma } from "./config/database.js";

async function main() {
  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw<
      { current_database: string; current_user: string }[]
    >`
      SELECT
        current_database() AS current_database,
        current_user AS current_user
    `;

    console.log("Database connection successful:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();