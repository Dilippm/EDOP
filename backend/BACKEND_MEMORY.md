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
│   ├── index.js                    Health routes and auth router mount
│   └── authRoutes.js               Login route and rate limiter
├── controllers/authController.js   Login validation, bcrypt compare, JWT response
├── models/userModel.js             User lookup by email
└── services/bootstrapAdmin.js      Initial admin upsert
migrations/001_create_auth_schema.sql
scripts/migrate.js
```

## Current API and authentication behavior

- `GET /api/health` is a process health check; `GET /api/health/db` checks PostgreSQL.
- `POST /api/auth/login` accepts `{ "email": "...", "password": "..." }`. It is limited to 10 attempts per 15 minutes per client IP.
- Password verification uses bcrypt. The user query reads the database `password` column as `password_hash` for the controller.
- Successful login returns a one-day JWT in the JSON response as `accessToken`, plus a safe user object. The backend currently does not set an auth cookie or provide a token verification middleware.
- There is no registration, `/api/auth/me`, or `/api/auth/logout` endpoint in the current route tree. Consequently, frontend local profile persistence is not proof of backend authentication, and logout does not revoke a token.
- Login accepts email only, although the frontend login label says “Email or username.”
- The JWT uses issuer `edop-api`, audience `edop`, subject = user ID, and includes the role claim. Keep authorization decisions server-side; do not trust a client-saved profile.

## Database and migrations

- Migration `001_create_auth_schema.sql` creates `auth.users` and `auth.auth_identities`. Users have name, email, password, avatar URL, role, and timestamps. Email uniqueness is case-insensitive through a partial expression index.
- `auth.auth_identities` reserves provider identity records for Google and GitHub; no OAuth routes are implemented.
- `npm run migrate` currently runs only `001_create_auth_schema.sql` directly and does not track applied migrations. The SQL is not idempotent; do not rerun it against a database where it has already been applied.
- The bootstrap admin requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`; `ADMIN_NAME` is optional. Those bootstrap variables are not listed in the current `.env.example`.

## Configuration and integration notes

- `.env.example` lists `NODE_ENV`, `PORT`, `DATABASE_URL`, `FRONTEND_URL`, and `JWT_SECRET`. The checked-in JWT value is a placeholder; configure a strong random secret in the real `.env`.
- Defaults: API port `5000`, frontend origin `http://localhost:5173`. CORS allows that configured origin and credentials.
- Keep the frontend and backend hostnames consistent (for example, use `localhost` for both) when browser cookies are involved.
- `backend/README.md` still describes the earlier health-only scaffold and is stale about database startup and current auth behavior.

## Known gaps to keep in view

- The JWT is exposed to frontend JavaScript in the login response, and the current frontend discards it. No browser API client sends it on subsequent requests.
- There is no server-side session/revocation store, authenticated request middleware, registration flow, logout invalidation, or role enforcement attached to protected routes.
- `npm test` uses Node's test runner, but there are currently no backend test files.
- Do not claim refresh-safe server authentication, logout revocation, OAuth, or protected API authorization until those pieces are implemented and verified.
