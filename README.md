# Registrar Management System

A web-based system that lets students and teachers request school-issued documents (e.g. Transcript of Records, Certificate of Registration, True Copy of Grades) online — instead of lining up at the registrar's office — with online payment, digital receipts, and status notifications when documents are ready for release.

## Overview

Students and teachers submit document requests through a portal, fill out any additional information required for that specific document type, pay online, and track their request status until it's ready for pickup. Registrar staff manage incoming requests, configure document types, and organize the workflow from a dedicated admin interface.

## Tech Stack

- **PostgreSQL** — database
- **Express** — backend API
- **React** — frontend
- **Node.js** — runtime
- **Drizzle ORM** — database schema and queries
- **TypeScript**
- **Tailwind CSS + shadcn/ui** — styling and components

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** or **yarn** — package manager (comes with Node.js)
- **PostgreSQL** (v14 or higher) — [Download](https://www.postgresql.org/download/)
- **Git** — for version control

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/StrawverryIceCream/school-document-management-system.git
cd school-document-management-system
```

### 2. Install Dependencies

Install dependencies for both the frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

Copy the example environment file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

On Windows (PowerShell):
```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` and configure the following:

```env
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
SESSION_SECRET=replace_with_a_secure_random_secret
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

**Configuration steps:**

1. **DATABASE_URL** — In our Group chat(ask there)
  
2. **SESSION_SECRET** — Generate a secure random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **PORT** — Backend server port (default: 5000)

4. **CLIENT_ORIGIN** — Frontend URL (default: http://localhost:5173)

### 4. Generate Drizzle ORM Configuration

Generate the Drizzle client for database queries:

```bash
cd backend
npm run db:generate
```

### 5. Start the Development Servers

Open two terminal windows:

**Terminal 1 — Start the backend server:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Start the frontend:**
```bash
cd frontend
npm run dev
```

The application should now be running at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Project Structure

```
school-document-management-system/
├── backend/                    # Express backend
│   ├── src/                   # Source code
│   │   ├── routes/           # API route handlers
│   │   ├── db/               # Database schema and connection
│   │   └── index.ts          # Server entry point
│   ├── drizzle/              # Drizzle ORM generated files
│   ├── .env                  # Environment variables (YOU create this)
│   ├── .env.example          # Environment template
│   └── package.json
│
├── frontend/                  # React frontend
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and helpers
│   ├── public/               # Static assets
│   └── package.json
│
└── README.md
```

## ⚠️ IMPORTANT — DO NOT DO THESE

Read this carefully before making any changes:

### Database Commands — DO NOT RUN

**NEVER run these commands unless explicitly told by your instructor:**

```bash
# ❌ DO NOT RUN
npm run db:push
npm run db:migrate
npm run db:drop
npm run db:reset
```

**Why?** The database schema is already set up and shared across the team. Running migrations will modify the database structure and break everyone else's setup.

### File Placement — PUT FILES IN THE RIGHT PLACE

- **Backend code** → Always goes in `backend/src/`
- **Frontend components** → Always goes in `frontend/src/components/`
- **API routes** → Always goes in `backend/src/routes/`
- **React pages** → Always goes in `frontend/src/pages/`

**DO NOT:**
- Create files in the root directory
- Mix frontend and backend code
- Create new top-level folders without team discussion

### Environment Files — NEVER COMMIT SECRETS

**DO NOT:**
- Commit your `.env` file to git (it's already in `.gitignore`)
- Share your `SESSION_SECRET` publicly
- Push database credentials to the repository
- Modify `.env.example` with real credentials

**DO:**
- Keep your `.env` file local only
- Use the `.env.example` as a template
- Ask for the `DATABASE_URL` in the group chat

### Code Changes — ASK BEFORE MAJOR CHANGES

**DO NOT make these changes without team discussion:**
- Modify database schema files in `backend/src/db/`
- Change authentication logic
- Add new npm packages without discussing
- Modify environment variable names in `.env.example`
- Change API endpoint URLs or port numbers

### Git Workflow — PROTECT THE MAIN BRANCH

**DO NOT:**
- Push directly to `main` branch
- Force push (`git push -f`) to any shared branch
- Commit `node_modules/` or `.env` files

**DO:**
- Create a feature branch for your work
- Write clear commit messages
- Pull latest changes before starting work
- Review your changes before committing

## Troubleshooting

**Port already in use:**
```bash
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill the process or change the PORT in backend/.env
```

**Database connection failed:**
- Verify your `DATABASE_URL` is correct
- Check that PostgreSQL is running
- Confirm the database exists
- Ask for the correct connection string in the group chat

**Module not found errors:**
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```
