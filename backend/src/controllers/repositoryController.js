import {
  linkProjectRepository,
  listProjectRepositories,
  parseGitHubRepositoryUrl,
  unlinkProjectRepository,
} from "../services/repositoryService.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function respondToRepositoryError(error, res, action) {
  if (error?.code === "PROJECT_NOT_FOUND") {
    return res.status(404).json({ message: "Project not found." });
  }
  if (error?.code === "REPOSITORY_NOT_FOUND") {
    return res.status(404).json({ message: "Repository link not found." });
  }
  if (error?.code === "PROJECT_FORBIDDEN") {
    return res.status(403).json({ message: "Only project owners can manage project repositories." });
  }
  if (error?.code === "23505") {
    return res.status(409).json({ message: "This repository is already linked to the project." });
  }
  console.error(`Unable to ${action}:`, error);
  return res.status(500).json({ message: `Unable to ${action}.` });
}

export function createRepositoryControllers({
  linkRepository = linkProjectRepository,
  listRepositories = listProjectRepositories,
  unlinkRepository = unlinkProjectRepository,
} = {}) {
  return {
    async addRepository(req, res) {
      if (!validUuid(req.params.projectId)) {
        return res.status(400).json({ message: "Project ID must be a valid UUID." });
      }
      const repository = parseGitHubRepositoryUrl(req.body?.repoUrl);
      if (repository.error) return res.status(400).json({ message: repository.error });

      try {
        const linkedRepository = await linkRepository({
          projectId: req.params.projectId,
          userId: req.auth.sub,
          repository,
        });
        return res.status(201).json({ repository: linkedRepository });
      } catch (error) {
        return respondToRepositoryError(error, res, "link repository");
      }
    },

    async getRepositories(req, res) {
      if (!validUuid(req.params.projectId)) {
        return res.status(400).json({ message: "Project ID must be a valid UUID." });
      }
      try {
        const repositories = await listRepositories({
          projectId: req.params.projectId,
          userId: req.auth.sub,
        });
        return res.json({ repositories });
      } catch (error) {
        return respondToRepositoryError(error, res, "load project repositories");
      }
    },

    async removeRepository(req, res) {
      if (!validUuid(req.params.projectId) || !validUuid(req.params.repositoryId)) {
        return res.status(400).json({ message: "Project and repository IDs must be valid UUIDs." });
      }
      try {
        await unlinkRepository({
          projectId: req.params.projectId,
          repositoryId: req.params.repositoryId,
          userId: req.auth.sub,
        });
        return res.status(204).end();
      } catch (error) {
        return respondToRepositoryError(error, res, "unlink repository");
      }
    },
  };
}

export const { addRepository, getRepositories, removeRepository } = createRepositoryControllers();
