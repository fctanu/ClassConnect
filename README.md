# MERN TODO (TypeScript)

A full-stack TODO application built with the MERN stack and TypeScript. This project demonstrates a production-friendly architecture featuring JWT authentication with refresh-token rotation, a React + Vite frontend styled with Tailwind CSS, an Express + Mongoose backend, and workflows for testing, containerization, and CI.

---

## Quick Summary

- Purpose: A secure, modern TODO app to demonstrate end-to-end TypeScript development, authentication best-practices (rotating refresh tokens), and a developer-friendly local environment using Docker and CI.
- Status: Development-ready. Backend and frontend scaffolds are implemented, authentication and task CRUD are working, backend tests (Jest + Supertest) included, Docker and GitHub Actions CI configured.

---

## Features

- User registration and login with hashed passwords
- Access tokens (JWT) and rotating refresh tokens (httpOnly cookie)
- CRUD for tasks (create, read, update, delete)
- Frontend auth handling with axios interceptors to auto-refresh access tokens
- Server-side validation with `express-validator` and centralized error handling
- Backend tests using Jest + Supertest
- Dockerfiles and `docker-compose.yml` for local development
- CI workflow to run backend tests and build the frontend

---

## Tech Stack

- Backend: Node.js, Express, TypeScript, Mongoose
- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Database: MongoDB (Atlas for production, local Mongo in Docker Compose)
- Auth: JWT access tokens (stored in localStorage by frontend) + rotating refresh tokens in an httpOnly cookie
- Testing: Jest, ts-jest, Supertest
- CI: GitHub Actions
- Containerization: Docker + Docker Compose

---

## Repository Layout

- `backend/` — Express API (TypeScript)
- `frontend/` — React + Vite app (TypeScript)
- `docker-compose.yml` — Local compose setup (mongo, backend, frontend)
- `.github/workflows/ci.yml` — CI workflow for tests and frontend build

---

## Getting Started (Local Development)

Prerequisites:

- Node.js 18+ and npm
- (Optional) Docker & Docker Compose
- A MongoDB instance (Atlas or local)

1. Install dependencies

```bash
# from project root
npm install
# or install per workspace
cd backend && npm install
cd ../frontend && npm install
```

2. Environment variables

Create a `backend/.env` file with the following values (example):

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/merntodo?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_EXPIRES=15m
REFRESH_EXPIRES=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Do not commit secrets to version control.

3. Start dev servers (concurrently)

```bash
# from project root
npm run dev
```

- Backend runs on `http://localhost:4000`
- Frontend (Vite) runs on `http://localhost:5173`

API endpoints are proxied by the dev server; health check: `GET /api/health`.

---

## Running Tests (Backend)

The backend includes Jest + Supertest tests. The CI expects a MongoDB URI to be provided via `MONGO_URI`.

To run tests locally (ensure `backend/.env` contains `MONGO_URI`):

```bash
# from backend folder
npm test
```

Notes:

- Tests run against the MongoDB instance at `MONGO_URI`. For CI, set `CI_MONGO_URI` as a repository secret.

---

## Docker (Local Development)

You can run the full stack with Docker Compose (provides a local MongoDB):

```bash
docker compose up --build
```

Services:

- `mongo` — MongoDB
- `backend` — Express API (exposes port 4000)
- `frontend` — Built static assets served by nginx (exposes port 5173 mapped to 80 inside container)

To stop and remove containers:

```bash
docker compose down
```

---

## Continuous Integration

A GitHub Actions workflow is provided at `.github/workflows/ci.yml`. It runs backend tests and builds the frontend on push and pull requests to `main`/`master`.

Set the following repository secret for CI to run backend tests against a MongoDB instance:

- `CI_MONGO_URI` — MongoDB connection string used by the test job

---

## Security Notes

- Refresh tokens are stored in httpOnly cookies and hashed server-side; the server rotates refresh tokens on each use and revokes all tokens when reuse is detected.
- Access tokens are short-lived JWTs (configurable via `ACCESS_EXPIRES`) and intended to be stored in `localStorage` per this demo (for stronger security, consider storing access tokens in memory and only use cookies for refresh tokens).
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are long, random, and kept secret.
- For production, enforce HTTPS, set `secure` cookie flag, and use proper CORS origins.

---

## Development Notes & Extensibility

- Add tests for the frontend using React Testing Library — scaffold present but not yet exhaustive.
- Consider adding user sessions/devices metadata to support selective token revocation per device.
- Add rate limiting and request logging middleware for production readiness.

---

## Contributing

Contributions are welcome. Typical workflow:

- Create a branch: `git checkout -b feat/your-feature`
- Commit logically and push
- Open a PR against `main` and ensure CI passes

Please include tests for bugfixes and new features.

---

## License

MIT

---

If you'd like, I can also:

- Add a short developer `Makefile` or `tasks` script for common commands
- Add frontend React Testing Library tests
- Provide a deployment recipe for production (Docker registry, reverse proxy, and environment secrets)

Tell me which of those you'd like next.

# MERN TODO (TypeScript + JWT + Tailwind)

Scaffold for a MERN TODO app using TypeScript on backend and frontend, JWT authentication with refresh tokens, Tailwind CSS, and MongoDB Atlas.

Run `npm run dev` from the repo root to start frontend and backend in development (after installing deps).
