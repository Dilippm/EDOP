ALTER TABLE projects.project_repositories
    ALTER COLUMN github_repo_id DROP NOT NULL,
    ADD COLUMN verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
    ADD CONSTRAINT project_repositories_verification_status_check
        CHECK (verification_status IN ('unverified', 'verified')),
    ADD CONSTRAINT project_repositories_project_repo_url_unique
        UNIQUE (project_id, repo_url);
