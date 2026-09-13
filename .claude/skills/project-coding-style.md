---
name: project-coding-style
description: >
  Enforces the coding standards, architectural patterns, and best practices for this school document management system.
  Use this skill when writing new code, refactoring existing code, reviewing PRs, or when the user asks about
  project conventions. Incorporates senior-level expectations for code quality, structure, and maintainability.
---

# Project Coding Style Guide

This skill defines the coding standards and architectural patterns for the Registrar Management System.
Read this before writing any code. Follow these patterns exactly.

---

## Core Architectural Pattern: Context + Provider + Hooks

This project uses React Context API with a three-layer pattern. Follow this structure for all shared state.

### The Pattern

```
Context (interface only) → Provider (implementation) → Hook (safe accessor)
```

**✅ CORRECT Structure:**

```typescript
// 1. Context — interface only, exported for typing
// context/AuthContext.tsx
import { createContext } from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
```

```typescript
// 2. Provider — implementation with state and logic
// provider/AuthProvider.tsx
import { AuthContext } from "@/context/AuthContext";
import { getCurrentUser, login as apiLogin } from "@/api/auth";
import { useState, useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    await apiLogin(email, password);
    const userData = await getCurrentUser();
    setUser(userData);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

```typescript
// 3. Hook — safe accessor with error handling
// hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

```typescript
// 4. Usage in components
import { useAuth } from "@/hooks/useAuth";

function ProfilePage() {
  const { user, logout } = useAuth();
  return <div>Welcome, {user?.fullName}</div>;
}
```

### Why This Pattern

- **Separation of concerns**: Context defines the contract, Provider implements it, Hook provides safe access
- **Type safety**: Context typing prevents `null` errors
- **No prop drilling**: State flows through context, not props
- **Testability**: Mock the Provider, not individual components
- **Error boundaries**: Hook throws early if Provider is missing

---

## Backend Patterns

### Controller Pattern

Controllers handle request/response logic. Keep them focused on HTTP concerns.

**✅ CORRECT:**

```typescript
// controllers/auth.controller.ts
import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  req.session.userId = user.id;
  req.session.save((err) => {
    if (err) return res.status(500).json({ error: "Failed to start session" });
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  });
};
```

**❌ WRONG — mixing concerns:**

```typescript
// Don't put database logic in routes
router.post("/login", async (req, res) => {
  const user = await db.query.users.findFirst({ /* ... */ });
  // ...
});

// Don't put business logic in controllers
export const login = async (req: Request, res: Response) => {
  // Don't: send emails, process payments, complex validation
  // Controllers should coordinate, not implement business logic
};
```

### Routes Pattern

Routes wire controllers to endpoints. Keep them declarative.

**✅ CORRECT:**

```typescript
// routes/auth.routes.ts
import { Router } from "express";
import { login, signup, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.get("/me", requireAuth, me);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
```

**❌ WRONG:**

```typescript
// Don't inline handlers
router.post("/login", async (req, res) => {
  // 50 lines of logic here
});

// Don't use generic names
router.post("/auth", authHandler); // Which auth action?

// Don't skip middleware ordering
router.get("/me", me, requireAuth); // Wrong order
```

---

## Frontend Component Patterns

### Presentational vs Container Components

**Presentational components** receive props, render UI, no hooks except useAuth/useTheme.

**✅ CORRECT Presentational Component:**

```typescript
// components/auth/LoginForm.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type LoginFormProps = React.ComponentProps<"div"> & {
  error: string | null;
  loading: boolean;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
};

function LoginForm({
  className,
  error,
  loading,
  handleSubmit,
  email,
  setEmail,
  password,
  setPassword,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              {error && <p className="text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;
```

**Container components** (pages) orchestrate data and state.

**✅ CORRECT Container Component:**

```typescript
// pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  );
}
```

**❌ WRONG — everything in one component:**

```typescript
function Login() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      {/* 100 lines of JSX mixing logic and presentation */}
    </Card>
  );
}
```

---

## Anti-Patterns — DO NOT DO THESE

### ❌ Prop Drilling

**WRONG:**

```typescript
function App() {
  const [user, setUser] = useState(null);
  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }) {
  return <Sidebar user={user} setUser={setUser} />;
}

function Sidebar({ user, setUser }) {
  return <UserMenu user={user} setUser={setUser} />;
}
```

**RIGHT — Use Context:**

```typescript
// Already set up: AuthContext + AuthProvider + useAuth hook
function UserMenu() {
  const { user, setUser } = useAuth();
  return <div>{user.name}</div>;
}
```

### ❌ Inline Styles

**WRONG:**

```typescript
<div style={{ padding: "20px", color: "red" }}>Content</div>
```

**RIGHT — Use Tailwind:**

```typescript
<div className="p-5 text-destructive">Content</div>
```

### ❌ Creating New Tools When One Exists

**WRONG — reinventing validation:**

```typescript
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**RIGHT — Use existing tools:**

```typescript
// Use HTML5 validation
<Input type="email" required />

// Or use the project's validation library if one exists
// Check package.json first before writing custom validators
```

### ❌ Mixing Query Logic in Components

**WRONG:**

```typescript
function UsersList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers);
  }, []);
  
  return <div>{users.map(u => <User key={u.id} user={u} />)}</div>;
}
```

**RIGHT — Use existing API utilities:**

```typescript
// api/users.ts
export async function getUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// components/UsersList.tsx
function UsersList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);
  
  return <div>{users.map(u => <User key={u.id} user={u} />)}</div>;
}
```

### ❌ Magic Numbers and Strings

**WRONG:**

```typescript
if (user.role === "admin") { /* ... */ }
setTimeout(() => refetch(), 5000);
```

**RIGHT:**

```typescript
// Use enums or constants
const ROLES = { ADMIN: "admin", STUDENT: "student", STAFF: "staff" } as const;
const REFETCH_INTERVAL_MS = 5000;

if (user.role === ROLES.ADMIN) { /* ... */ }
setTimeout(() => refetch(), REFETCH_INTERVAL_MS);
```

---

## File Naming and Structure

### Frontend Structure

```
frontend/src/
├── api/                    # API client functions
│   ├── auth.ts
│   └── users.ts
├── components/
│   ├── ui/                # shadcn/ui components (DO NOT EDIT)
│   ├── auth/              # Domain-specific components
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── accounts/
│   ├── layout/
│   └── sidebar/
├── context/               # Context interfaces ONLY
│   ├── AuthContext.tsx
│   └── UsersContext.tsx
├── provider/              # Provider implementations
│   ├── AuthProvider.tsx
│   └── UsersProvider.tsx
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   └── useUsers.ts
├── pages/                 # Route pages (containers)
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── Accounts.tsx
├── types/                 # TypeScript types
│   └── index.ts
└── lib/                   # Utilities
    └── utils.ts
```

### Backend Structure

```
backend/src/
├── controllers/           # Request/response handlers
│   ├── auth.controller.ts
│   └── users.controller.ts
├── routes/                # Route definitions
│   ├── auth.routes.ts
│   └── users.routes.ts
├── middleware/            # Express middleware
│   ├── requireAuth.ts
│   └── requireRoles.ts
├── db/                    # Database layer
│   ├── schema.ts         # Drizzle schema (DO NOT MODIFY)
│   └── db.ts             # Database connection
└── server.ts              # Express app entry
```

### Naming Conventions

- **Files**: `kebab-case.tsx` or `PascalCase.tsx` for components
- **Components**: `PascalCase` (e.g., `LoginForm`, `UserMenu`)
- **Functions**: `camelCase` (e.g., `handleSubmit`, `validateEmail`)
- **Hooks**: `use` prefix (e.g., `useAuth`, `useUsers`)
- **Types**: `PascalCase` (e.g., `User`, `AuthContextType`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `API_BASE_URL`)

---

## Code Quality Standards

### TypeScript — No `any`

**WRONG:**

```typescript
function updateUser(data: any) {
  // ...
}
```

**RIGHT:**

```typescript
interface UpdateUserData {
  fullName?: string;
  email?: string;
}

function updateUser(data: UpdateUserData) {
  // ...
}
```

### Error Handling — Always Handle Errors

**WRONG:**

```typescript
async function login() {
  await apiLogin(email, password);
  navigate("/dashboard");
}
```

**RIGHT:**

```typescript
async function login() {
  try {
    await apiLogin(email, password);
    navigate("/dashboard");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Login failed");
    console.error("Login error:", err);
  }
}
```

### Imports — Use Path Aliases

**WRONG:**

```typescript
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../../hooks/useAuth";
```

**RIGHT:**

```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
```

### Comments — Write Why, Not What

**WRONG:**

```typescript
// Set loading to true
setLoading(true);

// Loop through users
users.forEach(user => { /* ... */ });
```

**RIGHT:**

```typescript
// Prevent duplicate submissions while request is in flight
setLoading(true);

// Email validation requires existing users check
const existing = await db.query.users.findFirst({
  where: eq(users.email, email),
});
```

---

## Senior Developer Expectations

This section incorporates senior-level standards from the `senior-collaborator` skill.

### Lead with Working Code

When implementing a feature, deliver working code first. Explanation comes after.

**WRONG approach:**
> "We could structure this several ways. One approach would be to use Context, which has these benefits... Another approach is Redux..."

**RIGHT approach:**
> [Delivers complete implementation using Context pattern]
> "This uses the existing AuthContext pattern. If you need Redux instead, say so."

### No Truncation

Complete the implementation. Never write:

```typescript
function UsersList() {
  // ... rest of the component
}

// Add more handlers here
```

Write the full component.

### Copy-Paste Ready

All code must run without modification. No placeholders.

**WRONG:**

```typescript
const API_URL = "YOUR_API_URL_HERE";
```

**RIGHT:**

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

### Correct Wrong Assumptions

If the user asks for something that breaks project patterns, say so directly.

**WRONG:**
> "That's an interesting approach! Let me implement it..."

**RIGHT:**
> "That breaks the Context + Provider + Hook pattern this project uses. Here's the correct way:"

### No Prop Drilling — Use Context

If you see code that would require passing props through 3+ levels, stop and create a Context instead.

**WRONG approach:**
> "I'll pass these props down through the component tree..."

**RIGHT approach:**
> "This needs shared state. I'll create a Context following the project's three-layer pattern."

---

## Tools to Use (Already in the Project)

### Frontend

- **UI Components**: `@/components/ui/*` (shadcn/ui) — DO NOT reimplement buttons, cards, inputs
- **Styling**: Tailwind CSS — DO NOT write custom CSS files
- **Routing**: React Router — already configured
- **API Client**: `@/api/*` — use existing patterns
- **State**: Context API — DO NOT install Redux, Zustand, etc.
- **Forms**: Native HTML5 validation + controlled inputs — DO NOT install form libraries

### Backend

- **Database**: Drizzle ORM — DO NOT write raw SQL
- **Validation**: Express built-in + manual checks — DO NOT install validation libraries without approval
- **Auth**: express-session + bcrypt — already configured
- **Types**: TypeScript — DO NOT use JSDoc

### Before Installing New Packages

1. Check if existing tools can solve it
2. Ask in group chat if new package is necessary
3. Get approval before `npm install`

---

## Quick Reference Checklist

Before submitting code, verify:

```
☐ Does this follow Context → Provider → Hook pattern?
☐ Are presentational components separated from containers?
☐ Did I avoid prop drilling?
☐ Am I using existing UI components, not creating new ones?
☐ Are all errors handled with try/catch?
☐ Did I use TypeScript properly (no `any`)?
☐ Are imports using path aliases (@/...)?
☐ Is the code in the right directory?
☐ Did I avoid magic numbers/strings?
☐ Is this code complete (no truncation)?
☐ Would this pass code review from a senior dev?
```

---

## When in Doubt

1. **Check existing code** — grep for similar patterns
2. **Use existing tools** — don't reinvent
3. **Ask before major changes** — database, auth, new packages
4. **Follow the pattern** — Context + Provider + Hook
5. **Keep it simple** — solve the problem, don't over-engineer

Read the `senior-collaborator` skill for response quality standards.
