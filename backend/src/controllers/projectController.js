import { createProject, deleteProject, listProjectsForUser } from "../services/projectService.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateProjectInput(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name || name.length > 150) {
    return { error: "Project name is required and must be 150 characters or fewer." };
  }

  if (body?.description !== undefined && body.description !== null && typeof body.description !== "string") {
    return { error: "Project description must be a string." };
  }

  return { name, description: body.description ?? null };
}

export function createAddProject({ projectCreator = createProject } = {}) {
  return async function addProject(req, res) {
    const values = validateProjectInput(req.body);
    if (values.error) return res.status(400).json({ message: values.error });

    try {
      const project = await projectCreator({ ...values, createdBy: req.auth.sub });
      return res.status(201).json({ project });
    } catch (error) {
      console.error("Unable to create project:", error);
      return res.status(500).json({ message: "Unable to create project." });
    }
  };
}

export const addProject = createAddProject();

export function createGetProjects({ projectLister = listProjectsForUser } = {}) {
  return async function getProjects(req, res) {
    try {
      const projects = await projectLister(req.auth.sub);
      return res.json({ projects });
    } catch (error) {
      console.error("Unable to load projects:", error);
      return res.status(500).json({ message: "Unable to load projects." });
    }
  };
}

export const getProjects = createGetProjects();

export function createDeleteProject({ projectDeleter = deleteProject } = {}) {
  return async function removeProject(req, res) {
    if (typeof req.params.projectId !== "string" || !UUID_PATTERN.test(req.params.projectId)) {
      return res.status(400).json({ message: "Project ID must be a valid UUID." });
    }

    try {
      await projectDeleter({ projectId: req.params.projectId, userId: req.auth.sub });
      return res.status(204).end();
    } catch (error) {
      if (error?.code === "PROJECT_NOT_FOUND") {
        return res.status(404).json({ message: "Project not found." });
      }
      if (error?.code === "PROJECT_FORBIDDEN") {
        return res.status(403).json({ message: "Only project owners can delete projects." });
      }
      console.error("Unable to delete project:", error);
      return res.status(500).json({ message: "Unable to delete project." });
    }
  };
}

export const removeProject = createDeleteProject();
