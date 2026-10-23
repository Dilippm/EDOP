CREATE SCHEMA projects;

CREATE TABLE projects.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT projects_name_nonblank CHECK (BTRIM(name) <> '')
);

CREATE INDEX projects_created_by_idx ON projects.projects(created_by);

CREATE TABLE projects.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role VARCHAR(30) NOT NULL DEFAULT 'developer',
    added_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT project_members_role_check
        CHECK (role IN ('owner', 'manager', 'developer', 'devops', 'viewer')),
    CONSTRAINT project_members_project_user_unique UNIQUE (project_id, user_id)
);

CREATE INDEX project_members_user_id_idx ON projects.project_members(user_id);
CREATE INDEX project_members_project_role_idx ON projects.project_members(project_id, role);

CREATE TABLE projects.project_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    github_repo_id BIGINT NOT NULL,
    owner_login VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    repo_url TEXT NOT NULL,
    default_branch VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT project_repositories_https_url_check
        CHECK (repo_url ~ '^https://[^/?#[:space:]]+([/?#][^[:space:]]*)?$'),
    CONSTRAINT project_repositories_project_github_repo_unique
        UNIQUE (project_id, github_repo_id)
);

CREATE INDEX project_repositories_project_id_idx
    ON projects.project_repositories(project_id);
