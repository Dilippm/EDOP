import assert from "node:assert/strict";
import test from "node:test";
import { createRepositoryControllers } from "../src/controllers/repositoryController.js";
import {
  linkProjectRepository,
  listProjectRepositories,
  parseGitHubRepositoryUrl,
  unlinkProjectRepository,
} from "../src/services/repositoryService.js";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const REPOSITORY_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";

function response() {
  return {
    statusCode: null,
    body: null,
    status(statusCode) { this.statusCode = statusCode; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  };
}

function repositoryInput() {
  return parseGitHubRepositoryUrl("https://github.com/Todo-AI-Team/todo-ai-team.git");
}

test("parses and normalizes a valid GitHub repository URL", () => {
  assert.deepEqual(repositoryInput(), {
    ownerLogin: "Todo-AI-Team",
    repoName: "todo-ai-team",
    repoUrl: "https://github.com/Todo-AI-Team/todo-ai-team",
  });
});

test("rejects malformed, unsupported, and non-canonical GitHub URLs", () => {
  for (const repoUrl of [
    "git@github.com:Todo-AI-Team/todo-ai-team.git",
    "http://github.com/Todo-AI-Team/todo-ai-team",
    "https://www.github.com/Todo-AI-Team/todo-ai-team",
    "https://github.com/Todo-AI-Team/todo-ai-team?tab=readme",
    "https://github.com/Todo-AI-Team/todo-ai-team#readme",
    "https://github.com/Todo-AI-Team/todo-ai-team/issues",
  ]) {
    assert.ok(parseGitHubRepositoryUrl(repoUrl).error, repoUrl);
  }
});

test("links a repository as an explicitly unverified URL when GitHub verification is unavailable", async () => {
  const calls = [];
  const savedRepository = { id: REPOSITORY_ID, verification_status: "unverified", github_repo_id: null };
  const database = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes("FROM projects.project_members")) return { rows: [{ role: "owner" }] };
      if (sql.startsWith("INSERT INTO projects.project_repositories")) return { rows: [savedRepository] };
      throw new Error("Unexpected query");
    },
  };

  const result = await linkProjectRepository(
    { projectId: PROJECT_ID, userId: USER_ID, repository: repositoryInput() },
    { database }
  );

  assert.equal(result, savedRepository);
  assert.match(calls[1].sql, /github_repo_id, owner_login/);
  assert.match(calls[1].sql, /NULL, \$2, \$3, \$4, NULL, 'unverified'/);
  assert.equal(calls[1].values[0], PROJECT_ID);
});

test("returns a conflict when the database rejects a duplicate repository link", async () => {
  const duplicate = new Error("duplicate");
  duplicate.code = "23505";
  const { addRepository } = createRepositoryControllers({
    linkRepository: async () => { throw duplicate; },
  });
  const res = response();

  await addRepository({
    params: { projectId: PROJECT_ID },
    body: { repoUrl: "https://github.com/Todo-AI-Team/todo-ai-team" },
    auth: { sub: USER_ID },
  }, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, { message: "This repository is already linked to the project." });
});

test("lists only repositories for an authorized project member", async () => {
  const repositories = [{ id: REPOSITORY_ID, project_id: PROJECT_ID, repo_name: "todo-ai-team" }];
  const calls = [];
  const database = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes("FROM projects.project_members")) return { rows: [{ role: "developer" }] };
      if (sql.includes("FROM projects.project_repositories")) return { rows: repositories };
      throw new Error("Unexpected query");
    },
  };

  const result = await listProjectRepositories({ projectId: PROJECT_ID, userId: USER_ID }, { database });

  assert.equal(result, repositories);
  assert.deepEqual(calls[1].values, [PROJECT_ID]);
});

test("does not disclose repositories to unrelated users", async () => {
  const database = { query: async () => ({ rows: [] }) };
  await assert.rejects(
    listProjectRepositories({ projectId: PROJECT_ID, userId: USER_ID }, { database }),
    (error) => error.code === "PROJECT_NOT_FOUND"
  );
});

test("denies linking and unlinking for project members who are not owners", async () => {
  const database = { query: async () => ({ rows: [{ role: "manager" }] }) };
  await assert.rejects(
    linkProjectRepository({ projectId: PROJECT_ID, userId: USER_ID, repository: repositoryInput() }, { database }),
    (error) => error.code === "PROJECT_FORBIDDEN"
  );
  await assert.rejects(
    unlinkProjectRepository({ projectId: PROJECT_ID, repositoryId: REPOSITORY_ID, userId: USER_ID }, { database }),
    (error) => error.code === "PROJECT_FORBIDDEN"
  );
});

test("unlinks only the EDOP association", async () => {
  const calls = [];
  const database = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes("FROM projects.project_members")) return { rows: [{ role: "owner" }] };
      if (sql.startsWith("DELETE FROM projects.project_repositories")) return { rows: [{ id: REPOSITORY_ID }] };
      throw new Error("Unexpected query");
    },
  };

  await unlinkProjectRepository({ projectId: PROJECT_ID, repositoryId: REPOSITORY_ID, userId: USER_ID }, { database });

  assert.match(calls[1].sql, /^DELETE FROM projects\.project_repositories/);
  assert.deepEqual(calls[1].values, [REPOSITORY_ID, PROJECT_ID]);
});
