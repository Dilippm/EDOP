# EDOP Backend

Initial Express.js scaffold for the EDOP API, using JavaScript ES modules and PostgreSQL via `pg`. The server and its health endpoint start without connecting to PostgreSQL.

## Requirements

- Node.js 20+
- npm

## Setup

```sh
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env` when database access is added. The current scaffold does not connect to the database on startup.

## Run

```sh
npm run dev
```

The API listens on `http://localhost:5000` by default. Check `GET /api/health` for a basic API server status. This endpoint does not check database availability.

Use `npm start` to run without Nodemon and `npm test` to run the Node.js test runner.
