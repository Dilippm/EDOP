import pool from "../config/database.js";

export async function createProject({ name, description, createdBy }, { database = pool } = {}) {
  const client = await database.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const projectResult = await client.query(
      `INSERT INTO projects.projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by, created_at, updated_at`,
      [name, description, createdBy]
    );
    const project = projectResult.rows[0];

    await client.query(
      `INSERT INTO projects.project_members (project_id, user_id, role, added_by)
       VALUES ($1, $2, 'owner', $2)`,
      [project.id, createdBy]
    );

    await client.query("COMMIT");
    return project;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Unable to roll back project creation:", rollbackError);
      }
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function listProjectsForUser(userId, { database = pool } = {}) {
  const result = await database.query(
    `SELECT p.id, p.name, p.description, p.created_by, p.created_at, p.updated_at,
            pm.role AS member_role
     FROM projects.projects p
     INNER JOIN projects.project_members pm ON pm.project_id = p.id
     WHERE pm.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function deleteProject({ projectId, userId }, { database = pool } = {}) {
  const membershipResult = await database.query(
    `SELECT role
     FROM projects.project_members
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  const membership = membershipResult.rows[0];
  if (!membership) {
    const error = new Error("PROJECT_NOT_FOUND");
    error.code = "PROJECT_NOT_FOUND";
    throw error;
  }
  if (membership.role !== "owner") {
    const error = new Error("PROJECT_FORBIDDEN");
    error.code = "PROJECT_FORBIDDEN";
    throw error;
  }

  const deleted = await database.query(
    "DELETE FROM projects.projects WHERE id = $1 RETURNING id",
    [projectId]
  );
  if (!deleted.rows[0]) {
    const error = new Error("PROJECT_NOT_FOUND");
    error.code = "PROJECT_NOT_FOUND";
    throw error;
  }
}
