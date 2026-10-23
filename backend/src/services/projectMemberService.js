import pool from "../config/database.js";

const MEMBER_ROLES = new Set(["owner", "manager", "developer", "devops", "viewer"]);

function serviceError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

async function getMembership(projectId, userId, database) {
  const result = await database.query(
    "SELECT role FROM projects.project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId]
  );
  return result.rows[0] ?? null;
}

async function requireMembership(projectId, userId, { database, manage = false }) {
  const membership = await getMembership(projectId, userId, database);
  if (!membership) throw serviceError("PROJECT_NOT_FOUND");
  if (manage && membership.role !== "owner") {
    throw serviceError("PROJECT_FORBIDDEN");
  }
  return membership;
}

export function validateMemberInput(body) {
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body?.role === "string" ? body.role.trim().toLowerCase() : "developer";

  if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid member email address." };
  }
  if (!MEMBER_ROLES.has(role)) return { error: "Choose a valid project role." };
  return { email, role };
}

export async function listProjectMembers({ projectId, userId }, { database = pool } = {}) {
  await requireMembership(projectId, userId, { database });
  const result = await database.query(
    `SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.added_by, pm.created_at, pm.updated_at,
            u.name, u.email, u.avatar_url
     FROM projects.project_members pm
     INNER JOIN auth.users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY CASE pm.role WHEN 'owner' THEN 0 WHEN 'manager' THEN 1 ELSE 2 END, u.name NULLS LAST, u.email NULLS LAST`,
    [projectId]
  );
  return result.rows;
}

export async function addProjectMember(
  { projectId, userId, email, role },
  { database = pool } = {}
) {
  await requireMembership(projectId, userId, { database, manage: true });

  const userResult = await database.query(
    "SELECT id, name, email, avatar_url FROM auth.users WHERE LOWER(email) = LOWER($1)",
    [email]
  );
  const memberUser = userResult.rows[0];
  if (!memberUser) throw serviceError("USER_NOT_FOUND");

  const result = await database.query(
    `INSERT INTO projects.project_members (project_id, user_id, role, added_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, project_id, user_id, role, added_by, created_at, updated_at`,
    [projectId, memberUser.id, role, userId]
  );
  return { ...result.rows[0], name: memberUser.name, email: memberUser.email, avatar_url: memberUser.avatar_url };
}
