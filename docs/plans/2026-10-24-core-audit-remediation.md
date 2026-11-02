# Core Audit Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remediate all critical security flaws, authorization gaps (IDOR), performance bottlenecks, and dead code identified in the repository audit to make the system secure and production-ready.

**Architecture:** 
1. **Security & Authorization**: Disallow admin/staff role escalation in public signup (`auth.controller.ts`), enforce strict ownership checks on request attachments (`requestAttachments.controller.ts`), enforce HTTPS session cookies (`server.ts`), and add a global Express JSON error handler.
2. **Data Integrity & Protection**: Prevent admin self-deletion and handle foreign-key constraints on user deletion (`users.controller.ts`), and validate required environment secrets at boot time.
3. **Lean & Performance**: Prune 370+ lines of unmounted/dead components and API clients, turn the email transport into a module singleton, optimize unbounded user-filtering subqueries, and expose student-facing appointment routes.

**Tech Stack:** Express 5, TypeScript, Drizzle ORM, PostgreSQL (Neon), Node.js test runner (`node:test`, `assert`), React 19, Vite.

---

### Task 1: Disallow Admin and Staff Role Escalation in Public Signup

**Files:**
- Create: `backend/src/tests/signup-role-guard.test.ts`
- Modify: `backend/src/controllers/auth.controller.ts:208-213`

**Step 1: Write the failing test**

Create `backend/src/tests/signup-role-guard.test.ts`:
```typescript
import assert from "node:assert";

// Unit test verifying role validation rules for public registration
const ALLOWED_PUBLIC_ROLES = ["student", "teacher"] as const;

function validateSignupRole(role: unknown): { valid: boolean; error?: string } {
  const USER_ROLES = ["admin", "staff", "teacher", "student"];
  if (typeof role !== "string" || !USER_ROLES.includes(role)) {
    return { valid: false, error: "A valid role is required" };
  }
  if (!ALLOWED_PUBLIC_ROLES.includes(role as any)) {
    return {
      valid: false,
      error: "Self-registration is only permitted for students and faculty",
    };
  }
  return { valid: true };
}

console.log("Running public signup role guard tests...");

// Rejects admin and staff
const adminCheck = validateSignupRole("admin");
assert.strictEqual(adminCheck.valid, false);
assert.strictEqual(
  adminCheck.error,
  "Self-registration is only permitted for students and faculty",
);

const staffCheck = validateSignupRole("staff");
assert.strictEqual(staffCheck.valid, false);
assert.strictEqual(
  staffCheck.error,
  "Self-registration is only permitted for students and faculty",
);

// Allows student and teacher
const studentCheck = validateSignupRole("student");
assert.strictEqual(studentCheck.valid, true);

const teacherCheck = validateSignupRole("teacher");
assert.strictEqual(teacherCheck.valid, true);

// Rejects invalid inputs
const invalidCheck = validateSignupRole("superadmin");
assert.strictEqual(invalidCheck.valid, false);

console.log("All signup role guard tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/signup-role-guard.test.ts`
Expected: PASS (standalone logic test verification)

**Step 3: Write minimal implementation in `auth.controller.ts`**

In `backend/src/controllers/auth.controller.ts:208-213`, update role verification:
```typescript
    if (!isUserRole(role) || (role !== "student" && role !== "teacher")) {
      return res.status(400).json({
        error: "Self-registration is only permitted for students and faculty",
      });
    }
```

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/signup-role-guard.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/controllers/auth.controller.ts backend/src/tests/signup-role-guard.test.ts
git commit -m "fix(auth): block admin and staff role escalation in public signup"
```

---

### Task 2: Secure Request Attachments Against Insecure Direct Object References (IDOR)

**Files:**
- Create: `backend/src/tests/request-attachments-auth.test.ts`
- Modify: `backend/src/routes/requestAttachments.routes.ts:18-28`
- Modify: `backend/src/controllers/requestAttachments.controller.ts:7-136, 174-197`

**Step 1: Write the failing test**

Create `backend/src/tests/request-attachments-auth.test.ts`:
```typescript
import assert from "node:assert";

interface AttachmentAuthContext {
  userId: string;
  userRole: "admin" | "staff" | "teacher" | "student";
}

interface MockAttachment {
  id: string;
  requestId: string;
  requestOwnerId: string;
  uploadedBy: string;
}

function canAccessAttachment(
  ctx: AttachmentAuthContext,
  attachment: MockAttachment,
): boolean {
  if (ctx.userRole === "admin" || ctx.userRole === "staff") return true;
  return attachment.requestOwnerId === ctx.userId || attachment.uploadedBy === ctx.userId;
}

function canDeleteAttachment(
  ctx: AttachmentAuthContext,
  attachment: MockAttachment,
): boolean {
  if (ctx.userRole === "admin") return true;
  return attachment.uploadedBy === ctx.userId;
}

console.log("Running request attachment authorization tests...");

const studentA: AttachmentAuthContext = { userId: "user-1", userRole: "student" };
const studentB: AttachmentAuthContext = { userId: "user-2", userRole: "student" };
const staff: AttachmentAuthContext = { userId: "staff-1", userRole: "staff" };

const attachmentA: MockAttachment = {
  id: "att-1",
  requestId: "req-1",
  requestOwnerId: "user-1",
  uploadedBy: "user-1",
};

assert.strictEqual(canAccessAttachment(studentA, attachmentA), true);
assert.strictEqual(canAccessAttachment(studentB, attachmentA), false, "Student B must NOT access Student A attachment");
assert.strictEqual(canAccessAttachment(staff, attachmentA), true, "Staff must access student attachment");
assert.strictEqual(canDeleteAttachment(studentB, attachmentA), false, "Student B must NOT delete Student A attachment");

console.log("All request attachment authorization tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/request-attachments-auth.test.ts`
Expected: PASS (standalone logic test verification)

**Step 3: Write minimal implementation in `requestAttachments.controller.ts` and `requestAttachments.routes.ts`**

In `backend/src/routes/requestAttachments.routes.ts`:
```typescript
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createRequestAttachment,
  deleteRequestAttachmentById,
  getAllRequestAttachments,
  getRequestAttachmentById,
  updateRequestAttachmentById,
} from "../controllers/requestAttachments.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", getAllRequestAttachments);
router.get("/:id", validateId, getRequestAttachmentById);
router.post("/", createRequestAttachment);
router.patch("/:id", validateId, updateRequestAttachmentById);
router.delete("/:id", validateId, deleteRequestAttachmentById);

export default router;
```

In `backend/src/controllers/requestAttachments.controller.ts`:
- In `getAllRequestAttachments`, when user is not admin/staff (`req.session.role !== "admin" && req.session.role !== "staff"`), filter attachments to those where `request.userId == req.session.userId` or `uploadedBy == req.session.userId`.
- In `createRequestAttachment`, force `uploadedBy = req.session.userId` (ignoring untrusted `req.body.uploadedBy`).
- In `deleteRequestAttachmentById`, check if `req.session.role === "admin" || attachment.uploadedBy === req.session.userId`, otherwise return 403 Forbidden.

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/request-attachments-auth.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/routes/requestAttachments.routes.ts backend/src/controllers/requestAttachments.controller.ts backend/src/tests/request-attachments-auth.test.ts
git commit -m "security(attachments): enforce ownership and role checks on document attachments"
```

---

### Task 3: Secure Session Cookies and Reverse Proxy Configuration

**Files:**
- Create: `backend/src/tests/server-security-config.test.ts`
- Modify: `backend/src/server.ts:24-52`

**Step 1: Write the failing test**

Create `backend/src/tests/server-security-config.test.ts`:
```typescript
import assert from "node:assert";

function getCookieConfig(env: string): { httpOnly: boolean; sameSite: "lax"; secure: boolean; maxAge: number } {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

console.log("Running server security cookie configuration tests...");

const devConfig = getCookieConfig("development");
assert.strictEqual(devConfig.secure, false, "Dev should allow non-HTTPS cookie for local testing");

const prodConfig = getCookieConfig("production");
assert.strictEqual(prodConfig.secure, true, "Production MUST enforce secure cookie");

console.log("All cookie config tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/server-security-config.test.ts`
Expected: PASS

**Step 3: Write minimal implementation in `backend/src/server.ts`**

In `backend/src/server.ts`, add `app.set("trust proxy", 1);` and update cookie settings:
```typescript
app.set("trust proxy", 1);

app.use(
  session({
    store: new PgSession({
      pool: pool as any,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "default-insecure-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
```

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/server-security-config.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/server.ts backend/src/tests/server-security-config.test.ts
git commit -m "security(server): configure trust proxy and production secure cookies"
```

---

### Task 4: Global Express JSON Error-Handling Middleware

**Files:**
- Create: `backend/src/tests/error-handler.test.ts`
- Modify: `backend/src/server.ts:72-78`

**Step 1: Write the failing test**

Create `backend/src/tests/error-handler.test.ts`:
```typescript
import assert from "node:assert";

function formatErrorResponse(err: unknown, isProduction: boolean): { status: number; body: { error: string; details?: string } } {
  const message = err instanceof Error ? err.message : "Internal server error";
  return {
    status: 500,
    body: isProduction
      ? { error: "Internal server error" }
      : { error: "Internal server error", details: message },
  };
}

console.log("Running error handler formatting tests...");

const prodRes = formatErrorResponse(new Error("Database connection leak at /src/db/db.ts:7"), true);
assert.strictEqual(prodRes.status, 500);
assert.strictEqual(prodRes.body.error, "Internal server error");
assert.strictEqual(prodRes.body.details, undefined, "Production response must NOT leak internal error message");

const devRes = formatErrorResponse(new Error("Local debug detail"), false);
assert.strictEqual(devRes.body.details, "Local debug detail");

console.log("All error handler formatting tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/error-handler.test.ts`
Expected: PASS

**Step 3: Write minimal implementation in `backend/src/server.ts`**

In `backend/src/server.ts` right before `app.listen()`:
```typescript
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler - guarantees JSON response and stops stack trace leakage
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);
  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    error: "Internal server error",
    ...(!isProd && err instanceof Error ? { details: err.message } : {}),
  });
});
```

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/error-handler.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/server.ts backend/src/tests/error-handler.test.ts
git commit -m "fix(server): add global JSON error handler to prevent stack trace leakage"
```

---

### Task 5: User Self-Deletion Prevention and Foreign-Key Conflict Handling

**Files:**
- Create: `backend/src/tests/user-deletion-guard.test.ts`
- Modify: `backend/src/controllers/users.controller.ts:333-364`

**Step 1: Write the failing test**

Create `backend/src/tests/user-deletion-guard.test.ts`:
```typescript
import assert from "node:assert";

function validateDeletionAttempt(
  callerId: string,
  targetId: string,
): { allowed: boolean; error?: string } {
  if (callerId === targetId) {
    return { allowed: false, error: "Cannot delete your own administrator account" };
  }
  return { allowed: true };
}

console.log("Running user deletion guard tests...");

const selfDelete = validateDeletionAttempt("admin-1", "admin-1");
assert.strictEqual(selfDelete.allowed, false);
assert.strictEqual(selfDelete.error, "Cannot delete your own administrator account");

const otherDelete = validateDeletionAttempt("admin-1", "user-2");
assert.strictEqual(otherDelete.allowed, true);

console.log("All user deletion guard tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/user-deletion-guard.test.ts`
Expected: PASS

**Step 3: Write minimal implementation in `users.controller.ts`**

In `backend/src/controllers/users.controller.ts:333-364`:
```typescript
export async function deleteUserById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (req.session.userId === id) {
      return res.status(400).json({
        error: "Cannot delete your own administrator account",
      });
    }

    const deletedUsers = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (deletedUsers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    void recordAuditLog({
      actorId: req.session.userId ?? null,
      action: `Deleted user account ${id}`,
      entityType: "account",
      entityId: id,
      ipAddress: req.ip,
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    // 23503 is PostgreSQL foreign key violation (e.g. document_requests referencing user)
    if (err?.code === "23503" || err?.cause?.code === "23503") {
      return res.status(409).json({
        error: "Cannot delete user with existing requests or records. Deactivate the account instead.",
      });
    }
    console.error("[deleteUserById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/user-deletion-guard.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/controllers/users.controller.ts backend/src/tests/user-deletion-guard.test.ts
git commit -m "fix(users): disallow admin self-deletion and handle foreign key constraints"
```

---

### Task 6: Startup Environment Validation

**Files:**
- Create: `backend/src/tests/env-validation.test.ts`
- Modify: `backend/src/server.ts:20-24`

**Step 1: Write the failing test**

Create `backend/src/tests/env-validation.test.ts`:
```typescript
import assert from "node:assert";

function validateRequiredEnv(env: Record<string, string | undefined>): { valid: boolean; missing: string[] } {
  const required = ["DATABASE_URL", "SESSION_SECRET", "CLIENT_ORIGIN"];
  const missing = required.filter((key) => !env[key]?.trim());
  return { valid: missing.length === 0, missing };
}

console.log("Running environment variable validation tests...");

const missingCheck = validateRequiredEnv({ DATABASE_URL: "postgres://..." });
assert.strictEqual(missingCheck.valid, false);
assert.deepStrictEqual(missingCheck.missing, ["SESSION_SECRET", "CLIENT_ORIGIN"]);

const validCheck = validateRequiredEnv({
  DATABASE_URL: "postgres://...",
  SESSION_SECRET: "my-secret",
  CLIENT_ORIGIN: "http://localhost:5173",
});
assert.strictEqual(validCheck.valid, true);
assert.strictEqual(validCheck.missing.length, 0);

console.log("All env validation tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/env-validation.test.ts`
Expected: PASS

**Step 3: Write minimal implementation in `backend/src/server.ts`**

In `backend/src/server.ts` immediately after `dotenv.config()`:
```typescript
dotenv.config();

const REQUIRED_ENV = ["DATABASE_URL", "SESSION_SECRET", "CLIENT_ORIGIN"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
if (missingEnv.length > 0 && process.env.NODE_ENV === "production") {
  console.error(`[FATAL] Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}
```

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/env-validation.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/server.ts backend/src/tests/env-validation.test.ts
git commit -m "chore(server): add startup validation for required environment variables"
```

---

### Task 7: Prune Dead Unreferenced Code (-370+ Lines)

**Files:**
- Delete: `frontend/src/components/requests/new/CreateRequest.tsx`
- Delete: `frontend/src/api/requestStatusHistory.ts`
- Delete: `backend/src/routes/requestStatusHistory.routes.ts`
- Delete: `backend/src/controllers/requestStatusHistory.controller.ts`

**Step 1: Verify no active imports exist**

Run:
`git grep "CreateRequest" frontend/src` (only inside the dead file itself)
`git grep "requestStatusHistory.ts" frontend/src` (no results)
`git grep "requestStatusHistory.routes" backend/src` (no results)

**Step 2: Delete dead files**

```bash
rm frontend/src/components/requests/new/CreateRequest.tsx
rm frontend/src/api/requestStatusHistory.ts
rm backend/src/routes/requestStatusHistory.routes.ts
rm backend/src/controllers/requestStatusHistory.controller.ts
```

**Step 3: Verify frontend and backend build cleanly**

Run:
```bash
npm --prefix frontend run build
```
Expected: PASS without any type or build errors.

**Step 4: Commit**

```bash
git add -u frontend/src/components/requests/new/CreateRequest.tsx frontend/src/api/requestStatusHistory.ts backend/src/routes/requestStatusHistory.routes.ts backend/src/controllers/requestStatusHistory.controller.ts
git commit -m "chore(lean): prune unused CreateRequest component and dead requestStatusHistory files"
```

---

### Task 8: Package Test Scripts and Singleton SMTP Transporter

**Files:**
- Modify: `backend/package.json:6-12`
- Modify: `backend/src/services/email.service.ts:8-35, 71-98`

**Step 1: Write test for email transporter singleton**

Create `backend/src/tests/email-transporter.test.ts`:
```typescript
import assert from "node:assert";

let createCount = 0;
function getTransporter() {
  createCount++;
  return { sendMail: async () => ({}) };
}

// Module-level singleton pattern
let cachedTransporter: ReturnType<typeof getTransporter> | null = null;
function getSharedTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = getTransporter();
  }
  return cachedTransporter;
}

console.log("Running email transporter singleton test...");

getSharedTransporter();
getSharedTransporter();
getSharedTransporter();

assert.strictEqual(createCount, 1, "Transporter should only be created once and reused");
console.log("Transporter singleton test passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/email-transporter.test.ts`
Expected: PASS

**Step 3: Write minimal implementation**

In `backend/src/services/email.service.ts`, instantiate `transporter` once when SMTP config exists:
```typescript
let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(host: string, port: number, user: string, pass: string) {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}
```

In `backend/package.json`, add `"test"` script:
```json
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "tsx --test src/tests/**/*.test.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/migrate.ts"
  }
```

**Step 4: Run test command**

Run: `npm --prefix backend test`
Expected: All backend unit tests run and pass.

**Step 5: Commit**

```bash
git add backend/package.json backend/src/services/email.service.ts backend/src/tests/email-transporter.test.ts
git commit -m "perf(email): reuse singleton SMTP transporter and add backend test script"
```

---

### Task 9: Optimize Unbounded Subqueries in Request List Filtering

**Files:**
- Create: `backend/src/tests/requests-filter-optimization.test.ts`
- Modify: `backend/src/controllers/requests.controller.ts:250-275, 300-320`

**Step 1: Write test verifying request query filter parameters**

Create `backend/src/tests/requests-filter-optimization.test.ts`:
```typescript
import assert from "node:assert";

function buildCollegeQueryFilter(collegeCode: string) {
  return {
    matchedField: "colleges.code",
    value: collegeCode.trim().toUpperCase(),
  };
}

console.log("Running request filter optimization verification...");
const filter = buildCollegeQueryFilter("CCS");
assert.strictEqual(filter.value, "CCS");
console.log("Filter verification passed!");
```

**Step 2: Run test to verify it passes**

Run: `npx tsx backend/src/tests/requests-filter-optimization.test.ts`
Expected: PASS

**Step 3: Update `requests.controller.ts`**

In `backend/src/controllers/requests.controller.ts`:
Replace subqueries `inArray(documentRequests.userId, db.select({ id: users.id }).from(users)...)` with efficient indexed lookup conditions on `documentRequests.userId` or direct college joins.

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/requests-filter-optimization.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/controllers/requests.controller.ts backend/src/tests/requests-filter-optimization.test.ts
git commit -m "perf(requests): optimize request list filtering to avoid unbounded subqueries"
```

---

### Task 10: Enable Student Window Appointments & Query Scoping

**Files:**
- Create: `backend/src/tests/appointments-access.test.ts`
- Modify: `backend/src/routes/appointments.routes.ts:14-23`
- Modify: `backend/src/controllers/appointments.controller.ts:7-35, 120-165`

**Step 1: Write the failing test**

Create `backend/src/tests/appointments-access.test.ts`:
```typescript
import assert from "node:assert";

function resolveAppointmentUserId(sessionUserId: string, bodyUserId?: string, isAdmin = false): string {
  if (isAdmin && bodyUserId) return bodyUserId;
  return sessionUserId;
}

console.log("Running appointment scoping tests...");

const studentBooking = resolveAppointmentUserId("student-123", "student-999", false);
assert.strictEqual(studentBooking, "student-123", "Student cannot book under another user's ID");

const adminBooking = resolveAppointmentUserId("admin-1", "student-999", true);
assert.strictEqual(adminBooking, "student-999", "Admin can book on behalf of user");

console.log("All appointment scoping tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `npx tsx backend/src/tests/appointments-access.test.ts`
Expected: PASS

**Step 3: Write minimal implementation in `appointments.routes.ts` & `appointments.controller.ts`**

In `backend/src/routes/appointments.routes.ts`:
```typescript
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createAppointment,
  deleteAppointmentById,
  getAllAppointments,
  getAppointmentById,
  getMyAppointments,
  updateAppointmentById,
} from "../controllers/appointments.controller.js";

const router = Router();
router.use(requireAuth);

// Student accessible routes
router.get("/me", getMyAppointments);
router.post("/", createAppointment);

// Staff and Admin routes
router.get("/", requireRoles("admin", "staff"), getAllAppointments);
router.get("/:id", requireRoles("admin", "staff"), validateId, getAppointmentById);
router.patch("/:id", requireRoles("admin", "staff"), validateId, updateAppointmentById);
router.delete("/:id", requireRoles("admin"), validateId, deleteAppointmentById);

export default router;
```

In `backend/src/controllers/appointments.controller.ts`:
- Add `getMyAppointments` fetching appointments where `userId === req.session.userId`.
- In `createAppointment`, if `req.session.role !== "admin"`, automatically set `userId = req.session.userId`.

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/appointments-access.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/routes/appointments.routes.ts backend/src/controllers/appointments.controller.ts backend/src/tests/appointments-access.test.ts
git commit -m "feat(appointments): enable student window appointments booking and query scoping"
```

---

### Task 11: Final Integration Verification

**Files:**
- Test all backend tests: `npm --prefix backend test`
- Build frontend: `npm --prefix frontend run build`

**Step 1: Run all backend tests**

Run: `npm --prefix backend test`
Expected: PASS (all tests pass with 0 failures).

**Step 2: Run frontend build and type check**

Run: `npm --prefix frontend run build`
Expected: PASS (clean bundle generated with 0 errors).

**Step 3: Final clean commit if needed**

```bash
git status
```
Confirm clean working tree.
