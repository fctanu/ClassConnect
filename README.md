# MERN Social Blog

A full-stack social feed application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. This project demonstrates a production-friendly architecture featuring JWT authentication with rotating refresh tokens, a React + Vite frontend styled with Tailwind CSS, and an Express + Mongoose backend.

---

## Features

- **Public Feed**: Browse community posts with titles, descriptions, and images.
- **User Accounts**: Secure registration and login (hashed passwords).
- **Authentication**: JWT access tokens (short-lived) + rotating refresh tokens (httpOnly cookie).
- **Post Management**: Create posts with text and images (images are stored locally in this demo).
- **Interactions**: Like/unlike posts with instant UI updates.
- **Security**: Server-side validation, centralized error handling, and rate limiting integration.
- **Developer Experience**: Docker Compose setup for local development, hot-reloading (Vite & ts-node-dev), and full TypeScript support.

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Database**: MongoDB (Local via Docker or Atlas)
- **Auth**: JWT Access Token + HttpOnly Refresh Token (Rotation enabled)
- **Testing**: Jest + Supertest (Backend), Vitest (Frontend)
- **Containerization**: Docker + Docker Compose

---

## Repository Layout

- `backend/` — Express API (TypeScript)
  - `src/models/` — Mongoose models (User, Post, PostLike)
  - `src/routes/` — API routes (Auth, Posts)
- `frontend/` — React + Vite app (TypeScript)
  - `src/pages/` — Dashboard (Feed), Login, Register
  - `src/components/` — UI components (PostCard, PostForm, etc.)
- `docker-compose.yml` — Local development orchestration
- `.github/workflows/` — CI pipelines

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+ and npm
- Docker & Docker Compose (optional, for easiest setup)

### Option A: Using Docker Compose (Recommended)

1. **Start the stack**:
   ```bash
   docker compose up --build
   ```
   This spins up MongoDB, Backend (port 4000), and Frontend (port 5173).

2. **Access the App**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend Health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

### Option B: Manual Setup

1. **Install Dependencies**:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Backend Configuration**:
   Create `backend/.env` with:
   ```env
   MONGO_URI=mongodb://localhost:27017/mernsocial
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ACCESS_EXPIRES=15m
   REFRESH_EXPIRES=7d
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
   *Ensure you have a MongoDB instance running.*

3. **Run Development Servers**:
   From the root directory:
   ```bash
   npm run dev
   ```
   *This uses `concurrently` to run both backend and frontend.*

---

## API Summary

| Method | Endpoint | Description | Access |
|Or | | | |
| GET | `/api/posts` | Get recent posts | Public |
| GET | `/api/posts/:id` | Get single post | Public |
| POST | `/api/posts` | Create a new post | Private |
| POST | `/api/posts/:id/like` | Toggle like | Private |
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public (Cookie) |

---

## License

MIT
