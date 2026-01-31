# ClassConnect 🎓

**ClassConnect** is a modern, secure, and premium social platform designed for students and academic communities. It allows users to share updates, engage in discussions, and connect with peers in a safe environment. Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and TypeScript, it features a robust backend with enterprise-grade security and a sleek, responsive frontend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Security](https://img.shields.io/badge/OWASP-Secured-brightgreen)

---

## ✨ Key Features

### 🚀 Core Functionality
*   **User Authentication**: Secure registration and login with JWT (Access + Refresh tokens) and HttpOnly cookies.
*   **Social Feed**: Create, view, update, and delete posts with rich text and images.
*   **Engagement**: Like and comment on posts in real-time.
*   **Media Uploads**: Secure image uploads with type validation and path traversal protection.
*   **Responsive Design**: Fully responsive UI built with Tailwind CSS and modern aesthetic principles.

### 🛡️ Enterprise-Grade Security
ClassConnect implements a "Security First" architecture, protecting against **OWASP Top 10** vulnerabilities:

*   **Authentication Hardening**:
    *   **Account Lockout**: 5 failed attempts trigger a 2-hour lockout to prevent brute-force attacks.
    *   **Password Policy**: Enforced complexity (uppercase, lowercase, number, min length).
    *   **Session Management**: Automatic cleanup of old refresh tokens (max 5 active sessions).
    *   **No User Enumeration**: Generic error messages prevent email harvesting.
*   **API Protection**:
    *   **Rate Limiting**: Granular limits on critical endpoints (Registration, Login, Posting, Comments).
    *   **DoS Protection**: Request size limits (10kb) and HTTP Parameter Pollution (HPP) defense.
*   **Injection & XSS Defense**:
    *   **NoSQL Injection**: Automatic sanitization of MongoDB queries.
    *   **XSS Protection**: Content Security Policy (CSP) and input sanitization headers.
*   **Secure Infrastructure**:
    *   **HTTPS Enforcement**: Strict Transport Security (HSTS) and automatic redirects in production.
    *   **Safe File Uploads**: Whitelisted MIME types and filename sanitization.
    *   **Security Logging**: Comprehensive audit logs for suspicious activities (`logs/security.log`).

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **State/Routing**: React Router DOM, Context API

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose with strict typing)
*   **Language**: TypeScript
*   **Validation**: Express Validator, Zod-like constraints
*   **Security Tools**: Helmet, rate-limit, mongo-sanitize, xss-clean, hpp, winston

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/class-connect.git
    cd class-connect
    ```

2.  **Install Dependencies** (Root, Backend, and Frontend)
    ```bash
    # Root
    npm install

    # Backend
    cd backend
    npm install
    
    # Frontend
    cd ../frontend
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `backend/` directory:
    ```env
    PORT=4000
    MONGO_URI=mongodb+srv://<your_connection_string>
    JWT_ACCESS_SECRET=<generated_128_char_secret>
    JWT_REFRESH_SECRET=<generated_128_char_secret>
    ACCESS_EXPIRES=15m
    REFRESH_EXPIRES=30d
    CLIENT_URL=http://localhost:5173
    NODE_ENV=development
    ```

### Running the Application

**Development Mode** (Run both servers concurrently):
```bash
# From the root directory
npm run dev
```
*   Frontend: `http://localhost:5173`
*   Backend: `http://localhost:4000`

**Data Seeding** (Optional):
Populate the database with dummy users and posts for testing:
```bash
cd backend
npx ts-node src/scripts/seed.ts
```
*   **Admin User**: `admin@classconnect.com` / `AdminPass123!`

---

## 🧪 Testing

The project includes an automated security test suite to verify protections:

```bash
cd backend
npx ts-node src/scripts/test-security.ts
```
This runs checks for:
*   User Enumeration
*   NoSQL Injection
*   Authentication Flows
*   Rate Limiting Effectiveness
*   XSS Sanitization

---

## 📂 Project Structure

```
class-connect/
├── backend/                # Express API
│   ├── src/
│   │   ├── config/         # DB & Cookie config
│   │   ├── middleware/     # Auth, RateLimit, Security, Logger
│   │   ├── models/         # Mongoose Schemas (User, Post, Comment)
│   │   ├── routes/         # API Routes
│   │   ├── scripts/        # Seeding & Testing scripts
│   │   └── utils/          # Helpers (Hash, Cleanup)
│   └── logs/               # Security audit logs
│
├── frontend/               # React App
│   ├── public/             # Static assets & .well-known
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth Context
│       ├── pages/          # Dashboard, Login, Register
│       └── services/       # API integration (Axios)
```

---

## 🔒 Security Policy
If you discover a security vulnerability, please report it to `security@classconnect.com` or refer to `frontend/public/.well-known/security.txt`. We are committed to addressing valid reports within 48 hours.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
