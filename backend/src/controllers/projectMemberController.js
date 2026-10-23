import {
  addProjectMember,
  listProjectMembers,
  validateMemberInput,
} from "../services/projectMemberService.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function respondToMemberError(error, res, action) {
  if (error?.code === "PROJECT_NOT_FOUND") return res.status(404).json({ message: "Project not found." });
  if (error?.code === "PROJECT_FORBIDDEN") return res.status(403).json({ message: "Only project owners can manage project members." });
  if (error?.code === "USER_NOT_FOUND") return res.status(404).json({ message: "No EDOP user was found with that email address." });
  if (error?.code === "23505") return res.status(409).json({ message: "This user is already a project member." });
  console.error(`Unable to ${action}:`, error);
  return res.status(500).json({ message: `Unable to ${action}.` });
}

export function createProjectMemberControllers({
  memberLister = listProjectMembers,
  memberAdder = addProjectMember,
} = {}) {
  return {
    async getMembers(req, res) {
      if (!UUID_PATTERN.test(req.params.projectId || "")) {
        return res.status(400).json({ message: "Project ID must be a valid UUID." });
      }
      try {
        const members = await memberLister({ projectId: req.params.projectId, userId: req.auth.sub });
        return res.json({ members });
      } catch (error) {
        return respondToMemberError(error, res, "load project members");
      }
    },

    async addMember(req, res) {
      if (!UUID_PATTERN.test(req.params.projectId || "")) {
        return res.status(400).json({ message: "Project ID must be a valid UUID." });
      }
      const values = validateMemberInput(req.body);
      if (values.error) return res.status(400).json({ message: values.error });
      try {
        const member = await memberAdder({ projectId: req.params.projectId, userId: req.auth.sub, ...values });
        return res.status(201).json({ member });
      } catch (error) {
        return respondToMemberError(error, res, "add project member");
      }
    },
  };
}

export const { getMembers, addMember } = createProjectMemberControllers();
