# EDOP — Internal Developer Platform

EDOP is a local-first learning and portfolio project for observing services, coordinating application releases and managing infrastructure through controlled workflows. Its design coordinates GitHub Actions, container registries, Helm, Argo CD, Kubernetes and Terraform rather than replacing them.

## Current status

**Phase 0: preparation and product design.** The repository currently contains a responsive React + Vite frontend preview and architecture/workflow/API proposals. Every dashboard metric and record is illustrative sample data; there are no live GitHub, Kubernetes, telemetry, Terraform or AWS integrations. Workflow actions are not operational.

## Run the frontend

Requirements: Node.js 20+ and npm.

```sh
cd frontend
npm install
npm run dev
```

Vite prints the local URL. `npm run build` creates a static production bundle in `dist/`; `npm run preview` serves that bundle locally. The UI imports DM Sans and Manrope from Google Fonts when network access is available and falls back to system fonts.

## Screens

- `/login` — preview sign-in
- `/dashboard` — overview dashboard
- `/repositories` — repository list
- `/pipelines` — pipeline runs and selectable details
- `/deployments` — deployment list
- `/infrastructure` and `/environments` — infrastructure sample operations
- `/monitoring` — observability overview; `/monitoring/metrics`, `/monitoring/logs`, `/monitoring/traces`, and `/monitoring/alerts` are navigation placeholders
- `/audit` and `/settings` — navigation placeholders

The root path `/` redirects to `/login` until the preview sign-in transition occurs, then to `/dashboard`. Dashboard paths are protected by an in-memory development placeholder: the login form does not verify credentials and refreshing clears the preview state. This is not real authentication or a security boundary. Unknown URLs show a not-found page.

The frontend source is organized by responsibility:

```text
frontend/src/
├── app/             Router configuration and development auth context/guard
├── routes/          Route-level wrappers, grouped by feature
├── features/        Feature pages, grouped by feature
├── components/
│   ├── dashboard/   Reused dashboard cards, metrics, and panel headers
│   ├── layout/      App shell, sidebar, and top bar
│   └── ui/          Shared badges, tables, page titles, and sample-data hint
├── data/            Sample fixtures and navigation configuration
├── App.jsx          Router and auth provider composition
└── main.jsx         React entry point
```

Shared UI is kept in `frontend/src/components/`; route-specific pages live in `frontend/src/features/<feature>/pages/`, with thin route wrappers in `frontend/src/routes/`. Sample fixtures are in `frontend/src/data/sampleData.js`. Replace them only when the corresponding API integration is implemented and verified.

## Architecture and workflow boundaries

See [architecture](docs/architecture.md), [workflow designs](docs/workflows.md), and the [API contract proposal](docs/api.md). Application release and infrastructure lifecycle are separate workflows. Normal code changes must never implicitly destroy or recreate infrastructure. Terraform operations are designed around durable operation records, a controlled asynchronous runner, state locking, plan review, explicit approval and audit history.

For future work sessions, see the [project handoff memory](docs/PROJECT_MEMORY.md) and [frontend handoff memory](frontend/FRONTEND_MEMORY.md).

## Delivery sequence

1. Prepare frontend, product model and contracts while completing the learning roadmap.
2. Build the authenticated backend foundation and operation records.
3. Integrate GitHub repositories and Actions.
4. Build image and GitOps application release flows.
5. Add guarded Terraform lifecycle operations.
6. Add Kubernetes diagnostics and observability.
7. Validate against temporary AWS infrastructure, destroy it and verify cleanup.
8. Harden, document and prepare the portfolio release.

Build locally first. Keep cloud use temporary and within the ₹0–₹500 monthly target wherever feasible. Estimate costs and verify cleanup before and after any future cloud validation. No cloud resources are provisioned by this Phase 0 project.
