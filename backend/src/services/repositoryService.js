import pool from "../config/database.js";

const GITHUB_REPOSITORY_PATH = /^\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/;

function createServiceError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

export function parseGitHubRepositoryUrl(repoUrl) {
  if (typeof repoUrl !== "string" || !repoUrl.trim()) {
    return { error: "A GitHub repository URL is required." };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(repoUrl.trim());
  } catch {
    return { error: "Enter a valid HTTPS GitHub repository URL." };
  }

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname.toLowerCase() !== "github.com" ||
    parsedUrl.port ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    return { error: "Enter a valid HTTPS GitHub repository URL without query parameters or fragments." };
  }

  const pathMatch = parsedUrl.pathname.match(GITHUB_REPOSITORY_PATH);
  if (!pathMatch) {
    return { error: "Enter a GitHub repository URL in the form https://github.com/owner/repository." };
  }

  const [, ownerLogin, repoName] = pathMatch;
  return {
    ownerLogin,
    repoName,
    repoUrl: `https://github.com/${ownerLogin}/${repoName}`,
  };
}

async function getProjectMembership(projectId, userId, database) {
  const result = await database.query(
    `SELECT role
     FROM projects.project_members
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  return result.rows[0] ?? null;
}

async function requireProjectAccess(projectId, userId, { database, manage }) {
  const membership = await getProjectMembership(projectId, userId, database);
  if (!membership) throw createServiceError("PROJECT_NOT_FOUND");
  if (manage && membership.role !== "owner") {
    throw createServiceError("PROJECT_FORBIDDEN");
  }
  return membership;
}

export async function linkProjectRepository(
  { projectId, userId, repository },
  { database = pool } = {}
) {
  await requireProjectAccess(projectId, userId, { database, manage: true });

  const result = await database.query(
    `INSERT INTO projects.project_repositories
       (project_id, github_repo_id, owner_login, repo_name, repo_url, default_branch, verification_status)
     VALUES ($1, NULL, $2, $3, $4, NULL, 'unverified')
     RETURNING id, project_id, github_repo_id, owner_login, repo_name, repo_url,
               default_branch, verification_status, created_at, updated_at`,
    [projectId, repository.ownerLogin, repository.repoName, repository.repoUrl]
  );
  return result.rows[0];
}

export async function listProjectRepositories(
  { projectId, userId },
  { database = pool } = {}
) {
  await requireProjectAccess(projectId, userId, { database, manage: false });
  const result = await database.query(
    `SELECT id, project_id, github_repo_id, owner_login, repo_name, repo_url,
            default_branch, verification_status, created_at, updated_at
     FROM projects.project_repositories
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId]
  );
  return result.rows;
}

export async function unlinkProjectRepository(
  { projectId, repositoryId, userId },
  { database = pool } = {}
) {
  await requireProjectAccess(projectId, userId, { database, manage: true });
  const result = await database.query(
    `DELETE FROM projects.project_repositories
     WHERE id = $1 AND project_id = $2
     RETURNING id`,
    [repositoryId, projectId]
  );
  if (!result.rows[0]) throw createServiceError("REPOSITORY_NOT_FOUND");
}
