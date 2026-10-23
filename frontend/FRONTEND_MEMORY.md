# EDOP frontend memory

This is a frontend-only handoff for future sessions. It summarizes the current implementation so a new session can make ordinary UI changes without rereading every source file. See [the project memory](../docs/PROJECT_MEMORY.md) for product scope and architecture constraints.

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
│   ├── auth-context.jsx            In-memory development auth placeholder
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
│   │   ├── Sidebar.jsx              Navigation, brand and preview sign-out
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
- Keep sample fixtures in `data/sampleData.js`; do not duplicate those records inline when a page can consume the fixture.
- Keep navigation metadata in `data/navigation.js`, which is shared by the sidebar.
- CSS currently uses global class names rather than CSS modules. `styles.css` is legacy/base styling; `dashboard.css` overrides and adds the screenshot-inspired design; `brand.css` is a small targeted override. When changing visual behavior, check selector order because `brand.css` is imported last.

## Current user experience

- Initial route is a sign-in screen. Submit and “Continue with GitHub” both set in-memory `signedIn` state and show the dashboard. They do **not** authenticate; the page explicitly labels this as UI preview mode.
- React Router routes are centralized in `app/router.jsx`. `/` redirects to `/login` or `/dashboard` depending on preview auth state. Dashboard routes are nested under `ProtectedRoute` and `DashboardLayout`; `/login` is nested under `AuthLayout`.
- Required routes: `/login`, `/dashboard`, `/repositories`, `/deployments`, `/infrastructure`, `/monitoring`, `/settings`. Additional routes preserve existing tabs: `/pipelines`, `/environments`, `/monitoring/:section`, and `/audit`.
- Unknown paths render a not-found page. Direct dashboard navigation redirects to login and returns to the originally requested path after preview sign-in.
- Auth state is memory-only and resets on refresh. The route guard is development UI behavior, not real authentication or a security control.
- Sign-out is exposed by clicking the profile area at the bottom of the sidebar. State is not persisted across refreshes.
- Main dashboard is `OverviewPage.jsx`: screenshot-inspired dark sidebar and light canvas, summary cards, recent pipeline/deployment tables, system-health rings and illustrative chart, infrastructure table, alerts and activity feed.
- Repositories, Pipelines (including selectable row detail), Deployments, Infrastructure and Observability each have page modules.
- Environments currently reuses the Infrastructure page. Metrics, Logs, Traces, Alerts, Audit and Settings currently use `PlaceholderPage`; they are navigation placeholders, not implemented functionality.
- Buttons/filters that are not explicitly wired remain decorative or disabled. No page calls a backend.
- All values are sample data. The green “Live” label/chart are illustrative and should not be presented as live telemetry.
- Sidebar brand currently displays `EDOP` on its own line with `ENTERPRISE DEPLOYMENT PLATFORM` on one line beneath it. Keep the descriptor inside the fixed sidebar width.

## Notes for the next frontend change

1. Preserve the reusable component boundaries and existing screenshot design unless the user requests a visual change.
2. Avoid adding real auth/integration claims until the matching backend exists.
3. For a new screen, add a page component and map the nav item in `App.jsx`; reuse UI components and fixtures where applicable.
4. For a new reusable visual element, add it under the matching `components/ui/`, `components/dashboard/`, or `components/layout/` folder rather than expanding `App.jsx`.
5. Route definitions are in `app/router.jsx`; update `data/navigation.js` when adding or changing sidebar destinations. Keep route wrappers thin and point them at existing feature page components.
6. Verify builds with `npm run build` from `frontend/` when appropriate. Existing Vite warnings about module-level `use client` directives come from `lucide-react` and React Router packages and are non-blocking.
