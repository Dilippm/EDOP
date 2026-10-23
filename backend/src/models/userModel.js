
import pool from "../config/database.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, name, email, password AS password_hash, role
     FROM auth.users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  );

  return result.rows[0] ?? null;
}
