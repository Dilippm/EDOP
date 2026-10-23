# EDOP project memory

This file is a short handoff for future sessions. Read it before exploring the repository; consult the linked source documents only when the task needs detail.

## Project purpose

EDOP (Enterprise Deployment Observability Platform) is a local-first Internal Developer Platform portfolio project. It is intended to coordinate established tools for three capabilities:

- **Observe:** GitHub repository and Actions activity, Kubernetes status, logs, metrics and traces.
- **Deploy:** application releases through CI, image publishing, Helm/GitOps and Argo CD.
- **Provision:** approved Terraform plan/apply/destroy operations with review and audit history.

EDOP coordinates tools rather than reimplementing them. Normal application changes must remain independent of infrastructure lifecycle operations. Never allow a normal app release to implicitly destroy or recreate infrastructure.

## Current repository state

The project is in **Phase 0: preparation and product design**. The React/Vite frontend is a sample-data preview with React Router route wrappers and an in-memory development-only auth placeholder. There is no backend, real authentication, GitHub integration, CI/CD orchestration, Terraform runner, Kubernetes connection, telemetry connection or cloud environment in this repository yet. Dashboard values and action results are illustrative; do not describe them as live or verified.

Project reference documents:

- [README](../README.md): run instructions, current status and frontend structure.
- [Architecture](architecture.md): system boundaries and proposed entities.
- [Workflow designs](workflows.md): separate application release and infrastructure lifecycle sequences.
- [API contract proposal](api.md): proposed endpoints; none are implemented yet.
- [Frontend handoff](../frontend/FRONTEND_MEMORY.md): exact UI structure and behavior.

## Current top-level structure

```text
docs/
  PROJECT_MEMORY.md       This project-wide handoff
  architecture.md         Architecture and design boundaries
  workflows.md            App deployment and Terraform lifecycle designs
  api.md                  Proposed API contracts
frontend/
  src/
    app/                  Central router, auth context and protected route
    routes/               Feature route wrappers
    features/             Feature-owned page components
    components/           Reusable UI, dashboard and layout components
    data/                 Sample fixtures and navigation config
    App.jsx                Router/auth provider composition
    *.css                 Base, dashboard and brand styles
```

The backend, deployment manifests, GitOps, Terraform and observability directories described by the proposed architecture have not been created as implemented project modules.

## Product and implementation constraints

- Complete the remaining DevOps learning roadmap while preparing frontend and architecture; defer real integrations until that learning period is complete.
- Build locally first. Keep temporary cloud use within the ₹0–₹500 monthly target wherever feasible; budget, provision temporarily, destroy and verify cleanup before claiming cloud validation.
- Keep app release and infrastructure lifecycle as separate authenticated workflows, operation records, permissions and audit events.
- Infrastructure work must use a controlled asynchronous runner, known templates, state locking, plan review, explicit apply/destroy authorization, redacted results and durable audit records. Do not permit arbitrary shell commands or unrestricted Terraform from the browser.
- Do not mark roadmap milestones or the release checklist complete without evidence.

## Useful commands

Run from `frontend/`:

```sh
npm install
npm run dev
npm run build
npm run preview
```

The last recorded frontend production build succeeded; Vite emitted non-blocking `lucide-react` module-directive warnings. Rebuild after relevant source changes if verification is useful.
