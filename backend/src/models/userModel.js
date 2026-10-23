
import pool from "../config/database.js";

export async function listUsers() {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at, updated_at
     FROM auth.users ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function createUser({ name, email, password, role }) {
  const result = await pool.query(
    `INSERT INTO auth.users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, password, role]
  );
  return result.rows[0];
}

export async function updateUser(id, { name, email, password, role }) {
  const result = await pool.query(
    `UPDATE auth.users SET name = $2, email = $3, role = $4,
       password = COALESCE($5, password), updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, created_at, updated_at`,
    [id, name, email, role, password]
  );
  return result.rows[0] ?? null;
}

export async function deleteUser(id) {
  const result = await pool.query("DELETE FROM auth.users WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}

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
