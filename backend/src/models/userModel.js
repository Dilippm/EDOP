
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


export async function findOrCreateOAuthUser({
  provider,
  providerId,
  name,
  email,
  avatarUrl,
}) {
  if (!["google", "github"].includes(provider)) {
    throw new Error("Unsupported OAuth provider.");
  }
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // A linked provider subject remains stable even if the provider email changes.
    const identityResult = await client.query(
      `SELECT u.id, u.name, u.email, u.role
       FROM auth.auth_identities i
       JOIN auth.users u ON u.id = i.user_id
       WHERE i.provider = $1
         AND i.provider_user_id = $2
       LIMIT 1`,
      [provider, providerId]
    );

    if (identityResult.rows[0]) {
      const user = identityResult.rows[0];
      await client.query(
        `UPDATE auth.auth_identities
         SET provider_email = $3
         WHERE provider = $1
           AND provider_user_id = $2`,
        [provider, providerId, email]
      );
      await client.query("COMMIT");
      return user;
    }

    // New provider identities can only join accounts already provisioned in EDOP.
    const userResult = await client.query(
      `SELECT id, name, email, role
       FROM auth.users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1
       FOR UPDATE`,
      [email]
    );

    if (!userResult.rows[0]) {
      const error = new Error(
        "Your account is not registered in EDOP. Please contact your administrator."
      );
      error.code = "OAUTH_USER_NOT_REGISTERED";
      throw error;
    }

    const user = userResult.rows[0];

    // The EDOP user exists, but their provider identity is not linked yet.
    await client.query(
      `INSERT INTO auth.auth_identities
         (user_id, provider, provider_user_id, provider_email)
       VALUES ($1, $2, $3, $4)`,
      [user.id, provider, providerId, email]
    );

    // Update the profile using data from the verified provider account.
    await client.query(
      `UPDATE auth.users
       SET avatar_url = COALESCE(avatar_url, $2)
       WHERE id = $1`,
      [user.id, avatarUrl || null]
    );

    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error.code === "23505") {
      const linked = await pool.query(
        `SELECT u.id, u.name, u.email, u.role
         FROM auth.auth_identities i
         JOIN auth.users u ON u.id = i.user_id
         WHERE i.provider = $1 AND i.provider_user_id = $2
         LIMIT 1`,
        [provider, providerId]
      );
      if (linked.rows[0]) return linked.rows[0];
    }
    throw error;
  } finally {
    client.release();
  }
}
