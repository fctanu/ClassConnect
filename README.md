<p align="center">
  <img src="https://img.shields.io/badge/ClassConnect-Campus_Social_Platform-1a1a2e?style=for-the-badge&labelColor=0B1220" alt="ClassConnect Banner"/>
</p>

<h1 align="center">🎓 ClassConnect</h1>

<p align="center">
  <strong>Your Campus, Connected.</strong><br/>
  A modern social platform designed for students and academic communities.
</p>

<p align="center">
  <a href="https://classconnecttest.vercel.app">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-classconnecttest.vercel.app-84cc16?style=for-the-badge" alt="Live Demo"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

---

## 📖 Overview

**ClassConnect** is a full-stack social platform that enables students to share updates, engage in discussions, and connect with peers in a modern, secure environment. Built with the **MERN Stack** and **TypeScript**, it features enterprise-grade security and a premium, responsive user interface.

### ✨ Highlights

- 🔐 **Secure Authentication** — JWT with HttpOnly cookies, refresh token rotation
- 📝 **Rich Content** — Create posts with images and engage through likes & comments
- 🛡️ **Enterprise Security** — OWASP-compliant protections against common vulnerabilities
- 📱 **Responsive Design** — Optimized for desktop, tablet, and mobile
- ⚡ **Real-time Status** — Live system health monitoring
- ☁️ **Cloud Deployed** — Hosted on Vercel with serverless functions

---

## 🖼️ Screenshots

<p align="center">
  <img src="https://via.placeholder.com/800x450/0B1220/84cc16?text=ClassConnect+Dashboard" alt="Dashboard Preview" width="80%"/>
</p>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/fctanu/ClassConnect.git
cd ClassConnect

# Install all dependencies (uses npm workspaces)
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/classconnect
JWT_ACCESS_SECRET=<your-128-character-secret>
JWT_REFRESH_SECRET=<your-128-character-secret>
ACCESS_EXPIRES=15m
REFRESH_EXPIRES=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Run Development Server

```bash
# Start both frontend and backend concurrently
npm run dev
```

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:5173   |
| Backend  | http://localhost:4000   |

---

## 🏗️ Architecture

```
ClassConnect/
├── api/                    # Vercel Serverless entry point
├── backend/                # Express.js API
│   ├── src/
│   │   ├── config/         # Database & cookie configuration
│   │   ├── middleware/     # Auth, rate limiting, security
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Helper functions
│   └── package.json
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context provider
│   │   ├── pages/          # Route pages
│   │   └── services/       # API integration
│   └── package.json
├── vercel.json             # Deployment configuration
└── package.json            # Workspace root
```

---

## 🛡️ Security Features

ClassConnect implements comprehensive security measures:

| Category | Protection |
|----------|------------|
| **Authentication** | Account lockout, password complexity, session limits |
| **Authorization** | JWT with short-lived access tokens, secure refresh rotation |
| **Input Validation** | NoSQL injection prevention, XSS sanitization |
| **Rate Limiting** | Endpoint-specific limits (login, registration, posts) |
| **Infrastructure** | Helmet headers, CORS, HPP protection |

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run security test suite
npx ts-node src/scripts/test-security.ts
```

---

## 🌐 Deployment

ClassConnect is deployed on **Vercel** with:

- ⚡ **Serverless Functions** for the Express backend
- 🌍 **Edge Network** for fast global delivery
- 🔄 **Automatic Deployments** on push to `master`

### Environment Variables (Vercel)

Configure these in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Your Vercel domain |
| `CRON_SECRET` | Secret for scheduled jobs |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ❤️ for the academic community</sub>
</p>
