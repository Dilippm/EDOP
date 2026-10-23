# EDOP frontend memory

This is a frontend-only handoff for future sessions. It summarizes the current implementation so a new session can make ordinary UI changes without rereading every source file. See [the backend memory](../backend/BACKEND_MEMORY.md) for API and database details, and [the project memory](../docs/PROJECT_MEMORY.md) for product scope and architecture constraints.

## Stack and run commands

- React with Vite, React Router, JSX, plain CSS and `lucide-react` icons.
- Dependencies and scripts are in `frontend/package.json`.
- Run from this directory: `npm run dev` (development), `npm run build` (production bundle), or `npm run preview` (serve the built bundle).
- `main.jsx` mounts `App.jsx` and imports base/dashboard/brand/router CSS.

## Source map

```text
src/
├── App.jsx                         RouterProvider + AuthProvider composition
├── app/
│   ├── router.jsx                  Central route tree and root redirect
│   ├── auth-context.jsx            Persistent local profile state + login request
│   └── ProtectedRoute.jsx          Redirects unauthenticated users to /login
├── routes/                         Thin route wrappers grouped by feature
├── features/                       Route-specific page components grouped by feature
├── main.jsx                        React entry point and global styles
├── styles.css                      Original base style rules and responsive defaults
├── dashboard.css                   Dashboard palette, layout, component and login styles
├── brand.css                       Sidebar wordmark alignment and descriptor sizing
├── router.css                      NavLink, focus and not-found link adjustments
├── data/
│   ├── navigation.js               Sidebar labels, URL paths and Lucide icons
│   └── sampleData.js               Illustrative repo, pipeline, deployment and infra fixtures
├── components/
│   ├── dashboard/
│   │   ├── HealthRing.jsx
│   │   ├── Metric.jsx
│   │   ├── PanelHeading.jsx
│   │   └── SummaryCard.jsx
│   ├── layout/
│   │   ├── AppShell.jsx             Sidebar + top bar + content frame
│   │   ├── Sidebar.jsx              Navigation, brand and logged-in profile/sign-out
│   │   └── Topbar.jsx               Search, appearance, notifications and avatar
│   └── ui/
│       ├── Badge.jsx
│       ├── DataTable.jsx
│       ├── PageTitle.jsx
│       └── SampleHint.jsx
└── features/<feature>/pages/       Login, dashboard, repository, deployment,
                                    infrastructure, monitoring, audit and settings pages
```

## Component and page conventions

- Keep reusable primitives in `components/ui/`; use them for consistent page headings, tables, badges and sample-data labeling.
- Put dashboard-only cards/panel parts in `components/dashboard/`.
- Keep layout/navigation shell pieces in `components/layout/`.
- Each feature page belongs in `features/<feature>/pages/`; `routes/<feature>/` should contain thin route adapters. `App.jsx` should remain the small router/provider composition.
- `features/repositories/pages/RepositoriesPage.jsx` owns the live project, repository-link, and project-member workflow; it is named for the legacy `/repositories` route but its page title is Projects.
- Keep sample fixtures in `data/sampleData.js`; do not duplicate those records inline when a page can consume the fixture.
- Keep navigation metadata in `data/navigation.js`, which is shared by the sidebar.
- CSS currently uses global class names rather than CSS modules. `styles.css` is legacy/base styling; `dashboard.css` overrides and adds the screenshot-inspired design; `brand.css` is a small targeted override. When changing visual behavior, check selector order because `brand.css` is imported last.

## Current user experience

- Initial route is a sign-in screen. Password login calls `POST /api/auth/login`; Google sign-in posts a Google Identity Services ID token to `POST /api/auth/google`; GitHub sign-in starts at `POST /api/auth/github/start` and completes at `POST /api/auth/github`. All flows persist the returned safe profile and access token in local storage for up to one day. Configure the matching Google client IDs in frontend/backend env files. Configure the GitHub OAuth app callback URL as `${FRONTEND_URL}/login`, and set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the backend. OAuth users must already be provisioned in EDOP.
- React Router routes are centralized in `app/router.jsx`. `/` redirects to `/login` or `/dashboard` depending on the saved profile. Dashboard routes are nested under `ProtectedRoute` and `DashboardLayout`; `/login` is nested under `AuthLayout`.
- Required routes: `/login`, `/dashboard`, `/repositories`, `/deployments`, `/infrastructure`, `/monitoring`, `/settings`. Additional routes preserve existing tabs: `/pipelines`, `/environments`, `/monitoring/:section`, and `/audit`.
- Unknown paths render a not-found page. Direct dashboard navigation redirects to login and returns to the originally requested path after sign-in.
- The frontend restores its display profile from `edop_auth_state` in local storage for up to one day. It does not call `/api/auth/me`. Treat this profile and the route guard as UI state only; local storage can be edited by the user.
- Sign-out is exposed by clicking the profile area at the bottom of the sidebar. It tries `POST /api/auth/logout` and always removes the saved profile. The current backend does not register that logout route, so server-side token invalidation is not implemented.
- `VITE_API_BASE_URL` can override the API base URL; the fallback is `http://localhost:5000/api`. Use `frontend/.env.local` for local overrides and restart Vite after changing it. Authenticated API calls send the saved Bearer access token.
- The login form accepts an email or username in its label, but the current backend login handler searches by email only.
- Main dashboard is `OverviewPage.jsx`: screenshot-inspired dark sidebar and light canvas, summary cards, recent pipeline/deployment tables, system-health rings and illustrative chart, infrastructure table, alerts and activity feed.
- `RepositoriesPage.jsx` is the Projects workspace at `/repositories`. It loads the signed-in user's projects with `GET /api/projects`; projects therefore persist across refreshes.
- Only platform administrators see the New project action. Creating a project makes the creator its project owner.
- Selecting a project loads its linked repositories and member roster. Any project member can view these. Only a project owner sees controls to link or unlink repositories, add members, or delete that project.
- Repository links use GitHub URLs and display their backend `verification_status`; current links are `unverified` until a GitHub repository integration is available.
- Repositories, Pipelines (including selectable row detail), Deployments, Infrastructure and Observability each have page modules.
- Environments currently reuses the Infrastructure page. Metrics, Logs, Traces, Alerts, Audit and Settings currently use `PlaceholderPage`; they are navigation placeholders, not implemented functionality.
- Dashboard, deployment, infrastructure, monitoring, audit, and most feature-page data remain sample fixtures. Authentication and the Projects workspace make live backend calls.
- All values are sample data. The green “Live” label/chart are illustrative and should not be presented as live telemetry.
- Sidebar brand displays `EDOP` with the one-line `ENTERPRISE DEPLOYMENT PLATFORM` descriptor. `brand.css` keeps `.brand-copy` flexible within the fixed sidebar width and sizes the descriptor independently; preserve these constraints when changing the wordmark.

## Notes for the next frontend change

1. Preserve the reusable component boundaries and existing screenshot design unless the user requests a visual change.
2. The frontend stores the login token in `edop_auth_state` and sends it as a Bearer token for protected project APIs. The server remains responsible for every authorization decision.
3. For a new screen, add a page component, route it in `app/router.jsx`, and update `data/navigation.js`; reuse UI components and fixtures where applicable.
4. For a new reusable visual element, add it under the matching `components/ui/`, `components/dashboard/`, or `components/layout/` folder rather than expanding `App.jsx`.
5. Route definitions are in `app/router.jsx`; update `data/navigation.js` when adding or changing sidebar destinations. Keep route wrappers thin and point them at existing feature page components.
6. Verify builds with `npm run build` from `frontend/` when appropriate. Existing Vite warnings about module-level `use client` directives come from `lucide-react` and React Router packages and are non-blocking.
