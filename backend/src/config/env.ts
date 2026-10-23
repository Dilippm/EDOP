import "dotenv/config";


// Environment variables
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  HOST: process.env.HOST ?? "127.0.0.1",
  PORT: Number(process.env.PORT ?? "3000"),
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://edop_user:your_password@localhost:5432/edop",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
} as const;
