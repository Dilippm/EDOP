import { Router } from "express";
import { addProject, getProjects, removeProject } from "../controllers/projectController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  addRepository,
  getRepositories,
  removeRepository,
} from "../controllers/repositoryController.js";
import { addMember, getMembers } from "../controllers/projectMemberController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/", requireAdmin, addProject);
router.get("/", requireAuth, getProjects);
router.delete("/:projectId", requireAuth, removeProject);
router.get("/:projectId/members", requireAuth, getMembers);
router.post("/:projectId/members", requireAuth, addMember);
router.post("/:projectId/repositories", requireAuth, addRepository);
router.get("/:projectId/repositories", requireAuth, getRepositories);
router.delete("/:projectId/repositories/:repositoryId", requireAuth, removeRepository);

export default router;
