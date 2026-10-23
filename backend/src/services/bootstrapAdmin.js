
import pool from "../config/database.js";
import { env } from "../config/env.js";
import bcrypt from "bcrypt";
export async function ensureBootstrapAdmin() {
  const email = env.adminEmail;
  const name = env.adminName;

  const password = env.adminPassword;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to create the bootstrap admin.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO auth.users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (LOWER(email)) WHERE email IS NOT NULL
     DO UPDATE SET
       role = 'admin',
       updated_at = NOW()
     RETURNING id, name, email, role`,
    [name, email.trim().toLowerCase(), passwordHash, "admin"]
  );

  console.log("Bootstrap admin verified:", {
    id: result.rows[0].id,
    email: result.rows[0].email,
    role: result.rows[0].role,
  });
}
