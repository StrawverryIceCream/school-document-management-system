# ARCH School Document Management System

A web-based credential request and lifecycle management platform for university registrars and academic institutions (modeled on TUP Manila). The system streamlines document requests (Transcript of Records, Certificate of Registration, True Copy of Grades, Honorable Dismissal, Clearances), replacing long registrar lines with self-service ordering, email OTP verification, payment proof validation, and hybrid document release (in-person window pickup or optional digital PDF download).

---

## Tech Stack

- **Backend:** Node.js, Express 5, TypeScript, `tsx`
- **Database & ORM:** PostgreSQL (Neon Serverless with WebSocket pool), Drizzle ORM, Drizzle Kit
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Radix UI / shadcn/ui, Lucide Icons, Sonner
- **Session & Security:** `express-session` (HTTP-only secure cookies), `bcrypt`, Node.js `crypto`
- **File Storage:** Cloudinary via `multer` (payment slips & requirement attachments)
- **Email Delivery:** Nodemailer (6-digit registration OTP & status alerts, with local dev console fallback)

---

## Role-Based Access Control (RBAC)

The system enforces strict multi-role separation across both database constraints and frontend routing:

- **Student:** Current students (`regular`, `irregular`, `graduating`) and former students (`alumni`). Request documents, track status, upload clearance attachments and payment proofs.
- **Teacher / Faculty:** Request employment certificates, service records, and teaching load clearances.
- **Registrar / HR Staff:** Manage incoming request queues, verify payment proofs, assign pickup windows, upload approved digital PDFs, and mark requests as ready or claimed.
- **Administrator:** Manage document catalogs, fee rules, colleges, degree programs, user accounts, and review audit logs.

---

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — for version control
- Neon PostgreSQL connection string (or local PostgreSQL v14+)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/StrawverryIceCream/school-document-management-system.git
cd school-document-management-system
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Environment Configuration

Copy the backend environment template:

**Windows (PowerShell):**
```powershell
cd backend
copy .env.example .env
```

**macOS / Linux:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Server & Client Configuration
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace_with_a_secure_random_secret

# Neon PostgreSQL Database
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Cloudinary Storage (for payment proofs and attachments)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SMTP Mail Server (Leave empty to log OTPs to the backend terminal in dev mode)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="ARCH Support <noreply@arch.edu>"
```

> **Tip:** Generate a secure session secret using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Running the Development Servers

Open two terminal windows from the repository root:

**Terminal 1 — Backend API Server:**
```bash
cd backend
npm run dev
```
*Backend runs on: `http://localhost:5000`*

**Terminal 2 — Frontend Client:**
```bash
cd frontend
npm run dev
```
*Frontend runs on: `http://localhost:5173` (Vite dev proxy forwards `/api` to port 5000)*

---

## Available Scripts

### Backend (`/backend`)
| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `tsx watch src/server.ts` | Starts development server with live reload. |
| `npm run build` | `tsc` | Compiles TypeScript to `dist/`. |
| `npm start` | `node dist/server.js` | Runs production build. |
| `npm run db:generate` | `drizzle-kit generate` | Generates Drizzle migration files from schema. |
| `npm run db:migrate` | `tsx src/migrate.ts` | Executes pending migrations against database. |

### Frontend (`/frontend`)
| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts Vite development server with HMR. |
| `npm run build` | `tsc -b && vite build` | Type-checks and creates production bundle in `dist/`. |
| `npm run lint` | `eslint .` | Runs ESLint rules. |
| `npm run preview` | `vite preview` | Previews production build locally. |

---

## Project Structure

```
school-document-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (auth, requests, payments, logs, etc.)
│   │   ├── db/
│   │   │   ├── db.ts         # Neon Serverless + Drizzle client instance
│   │   │   └── schema.ts     # PostgreSQL schema, check constraints, and relations
│   │   ├── middleware/       # Session guards (requireAuth, requireRoles), multer upload
│   │   ├── routes/           # Domain REST routers (/api/auth, /api/requests, etc.)
│   │   ├── services/         # Storage (Cloudinary), Email (Nodemailer), Audit services
│   │   ├── migrate.ts        # Migration execution script
│   │   └── server.ts         # Express server entry point & middleware pipeline
│   ├── drizzle/              # Generated SQL migrations
│   ├── .env.example          # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Typed client API callers
│   │   ├── components/       # Reusable UI primitives (shadcn/ui) and feature modals
│   │   ├── context/          # Shared context providers (Auth, Requests, Documents)
│   │   ├── hooks/            # Custom React hooks (useAuth, useMobile)
│   │   ├── lib/              # Client utilities, tone maps, registration constants
│   │   ├── pages/            # View pages (Home, NewRequest, MyRequest, Windows, Accounts, Logs)
│   │   ├── types/            # TypeScript interfaces mirroring backend schema
│   │   ├── App.tsx           # Client router & protected route layout
│   │   └── main.tsx          # React application root
│   ├── vite.config.ts        # Vite configuration with API reverse proxy
│   └── package.json
│
├── docs/
│   ├── architecture.md       # Full system architecture and ER diagrams
│   └── plans/                # PRD and feature design documents
└── README.md
```

---

## Important Development Guidelines

1. **Database Schema Safety:**
   - The team shares a central database. Coordinate with the team before modifying `backend/src/db/schema.ts` or running `npm run db:migrate`.
2. **File Placement Conventions:**
   - Put backend business logic in `backend/src/controllers/` or `backend/src/services/`.
   - Put new frontend route views in `frontend/src/pages/` and reusable widgets in `frontend/src/components/`.
3. **Environment Security:**
   - Never commit `.env` files or hardcode secrets into the codebase.
   - If SMTP credentials are omitted, OTPs will safely print to the backend terminal console for easy local testing.

---

## Development Workflow (Start to Finish)

Follow this lifecycle for day-to-day development:

1. **Local Development (Daily Loop):**
   - **Terminal 1 (Backend API):** `cd backend && npm run dev` (Runs on `http://localhost:5000`)
   - **Terminal 2 (Frontend Client):** `cd frontend && npm run dev` (Runs on `http://localhost:5173`, Vite dev proxy routes `/api` to port 5000)

2. **Schema & Migration Updates (When changing database tables):**
   - Modify tables in `backend/src/db/schema.ts`
   - Generate migration files: `cd backend && npm run db:generate`
   - Execute against database: `cd backend && npm run db:migrate`

3. **Pre-commit Verification (Local Quality Check):**
   Run local builds and tests before pushing to ensure zero CI breaks:
   ```bash
   # Backend verification
   cd backend && npm run build && npm test

   # Frontend verification
   cd ../frontend && npm run build && npm test
   ```

4. **Branching & Pull Request:**
   - Create a feature branch: `git checkout -b feat/my-feature`
   - Commit changes: `git commit -m "feat(scope): describe changes"`
   - Push and open a Pull Request: `git push -u origin feat/my-feature`

5. **Automated CI & Preview Checks:**
   - **GitHub Actions** runs `.github/workflows/ci.yml` (parallel Backend and Frontend typecheck + test suites).
   - **Vercel** automatically attaches an isolated **Preview URL** to your Pull Request for visual verification.

6. **Merge & Continuous Deployment (CD):**
   - Once CI passes, merge into `main`.
   - **Vercel** automatically builds and pushes the frontend bundle to the edge CDN.
   - **Render** automatically pulls `main`, compiles TypeScript, verifies `/health`, and restarts the production backend container.

---

## Deployment & CI/CD Architecture

The system uses a decoupled hosting model:

| Component | Platform | Configuration & Details |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Static Vite SPA bundle with edge CDN distribution and client-side SPA routing (`vercel.json`). |
| **Backend** | [Render](https://render.com) | Continuous Node.js web service running Express 5, session management, and Cloudinary uploads. |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL connected over TLS (`?sslmode=require`). |
| **CI Automation** | [GitHub Actions](https://github.com/features/actions) | Automated parallel build and unit test matrix on all PRs and pushes to `main`. |

### 1. Frontend Setup (Vercel)
1. Import repository in Vercel with **Framework Preset:** `Vite` and **Root Directory:** `frontend` (or root).
2. Configure the `/api` reverse proxy in `vercel.json` to keep `connect.sid` session cookies first-party (avoiding cross-origin cookie restrictions):
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://<your-render-app>.onrender.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### 2. Backend Setup (Render)
1. Create a Web Service connected to your repo with **Root Directory:** `backend`.
2. Service Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health` (responds with `{ ok: true }`)
3. Required Environment Variables:
   - `DATABASE_URL`: Neon PostgreSQL connection string (`?sslmode=require`)
   - `SESSION_SECRET`: 64-character random hex string
   - `CLIENT_ORIGIN`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app` without a trailing slash)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (optional for local/test console fallback)

### 3. Continuous Integration (GitHub Actions)
Configured in `.github/workflows/ci.yml`. Runs parallel test and build verification on all PRs and commits before reaching production.

---

## Troubleshooting

- **Port in use (`5000` or `5173`):**
  ```powershell
  # Windows
  netstat -ano | findstr :5000
  netstat -ano | findstr :5173
  ```
- **Database Connection Error:**
  - Verify that `DATABASE_URL` in `backend/.env` is valid and includes `?sslmode=require`.
- **Node Modules Reset:**
  ```bash
  # Backend
  cd backend && rm -rf node_modules package-lock.json && npm install
  # Frontend
  cd ../frontend && rm -rf node_modules package-lock.json && npm install
  ```
