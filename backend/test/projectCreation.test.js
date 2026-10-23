import assert from "node:assert/strict";
import test from "node:test";
import { createAddProject, createDeleteProject, createGetProjects, validateProjectInput } from "../src/controllers/projectController.js";
import { createRequireAuth } from "../src/middleware/requireAuth.js";
import { createProject, deleteProject } from "../src/services/projectService.js";

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("creates a project and assigns its creator as owner in one transaction", async () => {
  const calls = [];
  let released = false;
  const project = { id: "project-1", name: "EDOP Platform", description: "Internal platform" };
  const client = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.startsWith("INSERT INTO projects.projects")) return { rows: [project] };
      return { rows: [] };
    },
    release() {
      released = true;
    },
  };

  const result = await createProject(
    { name: project.name, description: project.description, createdBy: "user-1" },
    { database: { connect: async () => client } }
  );

  assert.equal(result, project);
  assert.equal(calls[0].sql, "BEGIN");
  assert.match(calls[1].sql, /INSERT INTO projects\.projects/);
  assert.match(calls[2].sql, /INSERT INTO projects\.project_members/);
  assert.deepEqual(calls[2].values, ["project-1", "user-1"]);
  assert.equal(calls[3].sql, "COMMIT");
  assert.equal(released, true);
});

test("rolls back and releases the connection when owner membership creation fails", async () => {
  const calls = [];
  let released = false;
  const membershipFailure = new Error("membership insert failed");
  const client = {
    async query(sql) {
      calls.push(sql);
      if (sql.startsWith("INSERT INTO projects.projects")) return { rows: [{ id: "project-1" }] };
      if (sql.startsWith("INSERT INTO projects.project_members")) throw membershipFailure;
      return { rows: [] };
    },
    release() {
      released = true;
    },
  };

  await assert.rejects(
    createProject(
      { name: "EDOP Platform", description: null, createdBy: "user-1" },
      { database: { connect: async () => client } }
    ),
    membershipFailure
  );

  assert.deepEqual(calls.map((sql) => sql.split(" ")[0]), ["BEGIN", "INSERT", "INSERT", "ROLLBACK"]);
  assert.equal(released, true);
});

test("rejects missing, blank, overlong, and invalid project input", () => {
  assert.ok(validateProjectInput({}).error);
  assert.ok(validateProjectInput({ name: "   " }).error);
  assert.ok(validateProjectInput({ name: "x".repeat(151) }).error);
  assert.ok(validateProjectInput({ name: "Valid", description: 42 }).error);
  assert.deepEqual(validateProjectInput({ name: "  Valid  ", description: undefined }), {
    name: "Valid",
    description: null,
  });
});

test("returns 201 with the created project and derives ownership from verified auth", async () => {
  const created = { id: "project-1", name: "EDOP Platform", description: null };
  let received;
  const addProject = createAddProject({
    projectCreator: async (values) => {
      received = values;
      return created;
    },
  });
  const req = {
    body: { name: " EDOP Platform ", created_by: "untrusted", role: "viewer" },
    auth: { sub: "verified-user" },
  };
  const res = createResponse();

  await addProject(req, res);

  assert.deepEqual(received, {
    name: "EDOP Platform",
    description: null,
    createdBy: "verified-user",
  });
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { project: created });
});

test("rejects an unauthenticated request before project creation", async () => {
  const requireAuth = createRequireAuth();
  const req = { get: () => "" };
  const res = createResponse();
  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Authentication is required." });
  assert.equal(nextCalled, false);
});

test("lists only the projects where the authenticated user is a member", async () => {
  const projects = [{ id: "project-1", name: "EDOP Platform", member_role: "owner" }];
  let receivedUserId;
  const getProjects = createGetProjects({
    projectLister: async (userId) => {
      receivedUserId = userId;
      return projects;
    },
  });
  const res = createResponse();

  await getProjects({ auth: { sub: "verified-user" } }, res);

  assert.equal(receivedUserId, "verified-user");
  assert.deepEqual(res.body, { projects });
});

test("allows an owner to delete a project and its dependent EDOP records", async () => {
  const calls = [];
  const database = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes("FROM projects.project_members")) return { rows: [{ role: "owner" }] };
      if (sql.startsWith("DELETE FROM projects.projects")) return { rows: [{ id: "project-1" }] };
      throw new Error("Unexpected query");
    },
  };
  await deleteProject({ projectId: "project-1", userId: "owner-1" }, { database });

  assert.match(calls[1].sql, /^DELETE FROM projects\.projects/);
  assert.deepEqual(calls[1].values, ["project-1"]);
});

test("denies project deletion for a non-owner", async () => {
  const forbidden = new Error("forbidden");
  forbidden.code = "PROJECT_FORBIDDEN";
  const removeProject = createDeleteProject({ projectDeleter: async () => { throw forbidden; } });
  const res = { ...createResponse(), end() { return this; } };

  await removeProject({
    params: { projectId: "11111111-1111-4111-8111-111111111111" },
    auth: { sub: "member-1" },
  }, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Only project owners can delete projects." });
});
