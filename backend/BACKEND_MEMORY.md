# EDOP backend memory

Backend handoff notes for routine changes. Check the relevant source files before changing behavior; this file is a short architecture map, not a substitute for the implementation.

## Stack and commands

- Express 5, JavaScript ES modules, PostgreSQL through `pg`, bcrypt password hashes, and `jsonwebtoken`.
- Run from `backend/`: `npm run dev`, `npm start`, `npm test`, `npm run migrate`.
- The development command runs Nodemon against `src/` and watches JavaScript and JSON files.
- `DATABASE_URL` is required when importing the PostgreSQL pool. The server bootstraps the admin before it begins listening.

## Source map

```text
src/
├── app.js                         Helmet, credentialed CORS, JSON parser, API routes
├── server.js                      Admin bootstrap, HTTP listener, graceful shutdown
├── config/
│   ├── env.js                      Environment parsing and basic validation
│   └── database.js                 Shared PostgreSQL pool
├── routes/
│   ├── index.js                    Health, auth, project, and user router mounts
│   ├── authRoutes.js               Login route and rate limiter
│   ├── projectRoutes.js            Project, member, and repository routes
│   └── userRoutes.js               Administrator-only user management routes
├── controllers/authController.js   Login validation, bcrypt compare, JWT response
├── controllers/projectController.js Project creation request handling
├── controllers/projectMemberController.js Project member request handling
├── controllers/repositoryController.js Project repository request handling
├── middleware/requireAuth.js        Verified Bearer-token middleware
├── middleware/requireAdmin.js       Verified administrator-only middleware
├── models/userModel.js             User lookup by email
├── services/bootstrapAdmin.js      Initial admin upsert
├── services/projectService.js      Transactional project creation
├── services/projectMemberService.js Project member access and persistence
└── services/repositoryService.js   Repository link access and persistence
migrations/001_create_auth_schema.sql
migrations/002_create_project_management_schema.sql
migrations/003_support_unverified_project_repository_links.sql
scripts/migrate.js
test/                              Native Node tests for project features
```

## Current API and authentication behavior

- `GET /api/health` is a process health check; `GET /api/health/db` checks PostgreSQL.
- `POST /api/auth/login` accepts `{ "email": "...", "password": "..." }`. It is limited to 10 attempts per 15 minutes per client IP.
- `POST /api/auth/google` accepts `{ "credential": "<Google ID token>" }`. It verifies the token audience with Google's Node auth library; set `GOOGLE_CLIENT_ID` in the backend and matching `VITE_GOOGLE_CLIENT_ID` in the frontend. New Google users are created with the developer role. If the verified email belongs to an unlinked account, sign-in is rejected so accounts are not silently linked.
- `GET /api/auth/github` begins a GitHub OAuth code flow using a short-lived state cookie. GitHub redirects to `${FRONTEND_URL}/login`; the frontend exchanges the resulting one-time ticket through `POST /api/auth/github/exchange`. Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL`; the callback URL must match the GitHub OAuth app configuration.
- Password verification uses bcrypt. The user query reads the database `password` column as `password_hash` for the controller.
- Successful login returns a one-day JWT in the JSON response as `accessToken`, plus a safe user object. The backend does not set an auth cookie, but `requireAuth` and `requireAdmin` verify Bearer tokens for protected routes.
- There is no password registration, `/api/auth/me`, or `/api/auth/logout` endpoint in the current route tree. OAuth identities link to already-provisioned EDOP users by verified email on first sign-in; frontend local profile persistence is not proof of backend authentication, and logout does not revoke a token.
- Login accepts email only, although the frontend login label says “Email or username.”
- The JWT uses issuer `edop-api`, audience `edop`, subject = user ID, and includes the role claim. Keep authorization decisions server-side; do not trust a client-saved profile.
- `requireAuth` verifies that JWT and confirms the subject still exists in `auth.users`; it places the verified claims in `req.auth`.
- `requireAdmin` also checks the user's current database role and guards administrator-only routes.
- `POST /api/projects` is administrator-only and creates a project and its owner membership in a single transaction. `GET /api/projects` returns projects where the authenticated user is a member. `DELETE /api/projects/:projectId` is owner-only and cascades only EDOP memberships and repository links. Project creation must not accept ownership fields from the request body.
- `GET /api/projects/:projectId/members` returns a project roster to project members. Only project owners may add existing EDOP users through `POST /api/projects/:projectId/members`. Project visibility is based on rows in `projects.project_members`.
- Project repository endpoints are `POST`, `GET`, and `DELETE /api/projects/:projectId/repositories` (the delete route also includes `:repositoryId`). Any project member can list repositories; only project owners can link or unlink them.

## Database and migrations

- Migration `001_create_auth_schema.sql` creates `auth.users` and `auth.auth_identities`. Users have UUID IDs, name, email, password, avatar URL, role, and timestamps. Email uniqueness is case-insensitive through a partial expression index.
- `auth.auth_identities` stores linked Google and GitHub provider identities.
- Migration `002_create_project_management_schema.sql` creates the project, project member, and project repository tables. Deleting a project cascades to its memberships and repository links; deleting auth users does not cascade into project data.
- Migration `003_support_unverified_project_repository_links.sql` makes `github_repo_id` nullable and adds `verification_status`. Repository URLs may be saved as `unverified` because the current GitHub sign-in flow does not retain a GitHub token capable of repository verification. An unverified link does not grant GitHub access or authorize deployment actions.
- `npm run migrate` discovers numbered migration files and records them in `public.edop_migrations` inside a transaction. It baselines the legacy auth migration when its two auth tables already exist, so the non-idempotent migration is not replayed.
- The bootstrap admin requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`; `ADMIN_NAME` is optional. Those bootstrap variables are not listed in the current `.env.example`.

## Configuration and integration notes

- `.env.example` lists `NODE_ENV`, `PORT`, `DATABASE_URL`, `FRONTEND_URL`, and `JWT_SECRET`. The checked-in JWT value is a placeholder; configure a strong random secret in the real `.env`.
- Defaults: API port `5000`, frontend origin `http://localhost:5173`. CORS allows that configured origin and credentials.
- Keep the frontend and backend hostnames consistent (for example, use `localhost` for both) when browser cookies are involved.
- `backend/README.md` still describes the earlier health-only scaffold and is stale about database startup and current auth behavior.

## Known gaps to keep in view

- The JWT is exposed to frontend JavaScript and stored in local storage for its one-day UI session. Project API calls send it as a Bearer token. This still carries the normal XSS exposure risk of browser-accessible tokens.
- There is no server-side session/revocation store, registration flow, `/api/auth/me`, or logout invalidation. Project routes do have server-side authentication and authorization.
- `npm test` uses Node's test runner. Current tests cover project creation, listing and deletion; repository URL linking; and member management using mocked database clients.
- Do not claim refresh-safe server authentication, logout revocation, or verified GitHub repository access until those pieces are implemented and verified.
