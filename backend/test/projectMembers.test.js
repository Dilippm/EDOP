import assert from "node:assert/strict";
import test from "node:test";
import { createProjectMemberControllers } from "../src/controllers/projectMemberController.js";
import {
  addProjectMember,
  listProjectMembers,
  validateMemberInput,
} from "../src/services/projectMemberService.js";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const OWNER_ID = "22222222-2222-4222-8222-222222222222";
const MEMBER_ID = "33333333-3333-4333-8333-333333333333";

function response() {
  return {
    statusCode: null,
    body: null,
    status(statusCode) { this.statusCode = statusCode; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("validates a member email and project role", () => {
  assert.deepEqual(validateMemberInput({ email: "Dev@EDOP.test", role: "devops" }), {
    email: "dev@edop.test",
    role: "devops",
  });
  assert.ok(validateMemberInput({ email: "invalid", role: "developer" }).error);
  assert.ok(validateMemberInput({ email: "dev@edop.test", role: "administrator" }).error);
});

test("adds an existing EDOP user to a project", async () => {
  const calls = [];
  const database = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes("FROM projects.project_members")) return { rows: [{ role: "owner" }] };
      if (sql.includes("FROM auth.users")) return { rows: [{ id: MEMBER_ID, name: "Dev", email: "dev@edop.test", avatar_url: null }] };
      if (sql.includes("INSERT INTO projects.project_members")) return { rows: [{ id: "membership-1", role: "developer" }] };
      throw new Error("Unexpected query");
    },
  };

  const member = await addProjectMember(
    { projectId: PROJECT_ID, userId: OWNER_ID, email: "dev@edop.test", role: "developer" },
    { database }
  );

  assert.equal(member.email, "dev@edop.test");
  assert.deepEqual(calls[2].values, [PROJECT_ID, MEMBER_ID, "developer", OWNER_ID]);
});

test("lists project members only for an authorized member", async () => {
  const members = [{ user_id: OWNER_ID, email: "owner@edop.test", role: "owner" }];
  const database = {
    async query(sql) {
      if (sql.includes("SELECT role FROM projects.project_members")) return { rows: [{ role: "viewer" }] };
      if (sql.includes("INNER JOIN auth.users")) return { rows: members };
      throw new Error("Unexpected query");
    },
  };

  assert.equal(await listProjectMembers({ projectId: PROJECT_ID, userId: MEMBER_ID }, { database }), members);
});

test("prevents non-owners from adding project members", async () => {
  const database = { query: async () => ({ rows: [{ role: "manager" }] }) };
  await assert.rejects(
    addProjectMember({ projectId: PROJECT_ID, userId: MEMBER_ID, email: "dev@edop.test", role: "developer" }, { database }),
    (error) => error.code === "PROJECT_FORBIDDEN"
  );
});

test("maps duplicate member attempts to a conflict response", async () => {
  const duplicate = new Error("duplicate");
  duplicate.code = "23505";
  const { addMember } = createProjectMemberControllers({ memberAdder: async () => { throw duplicate; } });
  const res = response();

  await addMember({
    params: { projectId: PROJECT_ID },
    auth: { sub: OWNER_ID },
    body: { email: "dev@edop.test", role: "developer" },
  }, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, { message: "This user is already a project member." });
});
