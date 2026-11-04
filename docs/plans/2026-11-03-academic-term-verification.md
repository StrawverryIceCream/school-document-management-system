# Academic Term Verification & Dynamic System Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable administrators to manage the active Academic Term Anchor in a global `system_settings` table and require returning non-alumni students to submit an Academic Term Verification request (updated `yearLevel`, `section`, `studentStatus`, and a Certificate of Registration / Graduation Proof image) reviewed by Administrators and Registrar (`OUR`) staff before filing new document requests.

**Architecture:**
1. Add `system_settings` (key-value store seeded with `activeAcademicTerm = "AY 2026–2027"`), `users.verified_academic_term` (nullable text), and `account_update_requests` (storing previous/requested standing + uploaded proof URL + review metadata) to `backend/src/db/schema.ts`.
2. Expose `GET /api/settings` publicly and `PATCH /api/settings` to `admin`; expose `/api/account-updates` for student submission (`POST /api/account-updates`, `GET /api/account-updates/me`) and Admin / Registrar (`OUR`) staff review (`GET /api/account-updates`, `PATCH /api/account-updates/:id/review`), and enforce the term verification gate in `POST /api/requests` (`createRequest`).
3. Provide a lightweight `SystemSettingsProvider` on the frontend that drives all 5 Academic Term Anchor displays, adds an Academic Term Verification banner + modal on `/home`, gates `/new-request` for unverified non-alumni students, and adds a "Term Update Requests" review tab (with `FilePreviewDialog` In-Situ Proof Preview and Canned Reason Presets) + active term switcher to `/accounts` for Admins and `OUR` staff.

**Tech Stack:** TypeScript, Express 5, Drizzle ORM (PostgreSQL), Multer + Cloudinary (`storage.service.ts`), React 19, Tailwind CSS, Radix/shadcn UI.

---

### Task 1: Database Schema (`systemSettings`, `users.verifiedAcademicTerm`, `accountUpdateRequests`)

**Files:**
- Modify: `backend/src/db/schema.ts`
- Modify: `frontend/src/types/index.ts`

**Step 1: Add schema definitions to `backend/src/db/schema.ts`**

Add `accountUpdateStatusEnum`, `systemSettings`, `verifiedAcademicTerm` on `users`, and `accountUpdateRequests` (plus relations):

```ts
export const accountUpdateStatusEnum = pgEnum("account_update_status", [
  "pending",
  "approved",
  "rejected",
]);

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

// Inside users table columns:
verifiedAcademicTerm: text("verified_academic_term"),

export const accountUpdateRequests = pgTable(
  "account_update_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    academicTerm: text("academic_term").notNull(),
    previousYearLevel: integer("previous_year_level"),
    previousSection: text("previous_section"),
    previousStudentStatus: studentStatusEnum("previous_student_status"),
    requestedYearLevel: integer("requested_year_level"),
    requestedSection: text("requested_section"),
    requestedStudentStatus: studentStatusEnum("requested_student_status").notNull(),
    proofFileUrl: text("proof_file_url").notNull(),
    proofFileName: text("proof_file_name").notNull(),
    status: accountUpdateStatusEnum("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    reviewedBy: uuid("reviewed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: tz("reviewed_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("account_update_requests_one_pending_per_user")
      .on(table.userId)
      .where(sql`${table.status} = 'pending'`),
    index("account_update_requests_status_created_idx").on(
      table.status,
      table.createdAt,
    ),
    index("account_update_requests_user_id_idx").on(table.userId),
  ],
);
```

**Step 2: Mirror types in `frontend/src/types/index.ts`**

Add `verifiedAcademicTerm: string | null` to `User`, and export `AccountUpdateStatus` and `AccountUpdateRequest` interfaces.

---

### Task 2: System Settings Backend (`GET /api/settings` & `PATCH /api/settings`) + Signup Term Stamping

**Files:**
- Create: `backend/src/controllers/settings.controller.ts`
- Create: `backend/src/routes/settings.routes.ts`
- Modify: `backend/src/controllers/auth.controller.ts`
- Modify: `backend/src/server.ts`
- Test: `backend/src/tests/academic-term-verification.test.ts`

**Step 1: Implement `getActiveAcademicTerm()` helper & `settings.controller.ts`**

- `DEFAULT_ACADEMIC_TERM = "AY 2026–2027"`.
- `getActiveAcademicTerm()` queries `systemSettings` where `key = 'activeAcademicTerm'`, returning the value or `DEFAULT_ACADEMIC_TERM`.
- `GET /api/settings`: returns `{ activeAcademicTerm }`.
- `PATCH /api/settings` (`requireAuth`, `requireRoles("admin")`): validates non-empty `activeAcademicTerm` (max 50 chars), upserts into `system_settings`, logs to `audit_logs`, and returns `{ activeAcademicTerm }`.

**Step 2: Update `auth.controller.ts`**

- Include `verifiedAcademicTerm: user.verifiedAcademicTerm ?? null` in `toAuthUser(user)`.
- In `signup()`, when `role === "student"`, set `verifiedAcademicTerm: await getActiveAcademicTerm()`.

---

### Task 3: Account Update Requests Backend & Hard Gate in `createRequest`

**Files:**
- Modify: `backend/src/services/storage.service.ts`
- Create: `backend/src/controllers/accountUpdates.controller.ts`
- Create: `backend/src/routes/accountUpdates.routes.ts`
- Modify: `backend/src/controllers/requests.controller.ts`
- Modify: `backend/src/server.ts`
- Test: `backend/src/tests/academic-term-verification.test.ts`

**Step 1: Add `uploadCorProof(buffer, userId)` to `storage.service.ts`**

Uploads image buffer to Cloudinary under `student-document-management-system/cor-proofs`.

**Step 2: Implement `accountUpdates.controller.ts`**

- Authorization helper `canReviewAccountUpdates(userId)`: returns `true` if `user.role === "admin"` or (`user.role === "staff"` and assigned office is `registrar` / `OUR`).
- `POST /api/account-updates` (`requireAuth`, `handleUpload("proofFile")`):
  - Only `student` role allowed.
  - Validates `requestedStudentStatus` (`regular`, `irregular`, `graduating`, `alumni`).
  - If `requestedStudentStatus !== "alumni"`, requires `requestedYearLevel` (1–6); if `"alumni"`, forces `requestedYearLevel = null` and `requestedSection = null`.
  - Requires `req.file` (uploaded COR / Graduation proof image).
  - Uploads image via `uploadCorProof`, inserts `accountUpdateRequests` row for the active academic term, notifies `OUR` staff via `notifyOfficeStaff({ officeCode: "registrar", ... })`, and records an audit log.
- `GET /api/account-updates/me` (`requireAuth`): returns the student's latest `accountUpdateRequests` row for the current active academic term (or latest overall).
- `GET /api/account-updates` (`requireAuth`, Admin or `OUR` staff): paginated list with `status` and `search` filters, including `user` (with `college` and `course`) and `reviewer`.
- `PATCH /api/account-updates/:id/review` (`requireAuth`, Admin or `OUR` staff):
  - Accepts `{ decision: "approved" | "rejected", rejectionReason?: string }`.
  - Inside a DB transaction:
    - On `"approved"`: updates `accountUpdateRequests.status = "approved"`, `reviewedBy`, `reviewedAt`, and updates `users` (`yearLevel`, `section`, `studentStatus`, `verifiedAcademicTerm = request.academicTerm`).
    - On `"rejected"`: requires `rejectionReason`, updates `accountUpdateRequests.status = "rejected"`, `rejectionReason`, `reviewedBy`, `reviewedAt`.
  - Dispatches Dual Dispatch notification (`createAndDispatchNotification`) and records audit log.

**Step 3: Enforce Hard Gate in `createRequest` (`backend/src/controllers/requests.controller.ts`)**

In `createRequest`, fetch the requesting user (`role`, `studentStatus`, `verifiedAcademicTerm`) and `activeAcademicTerm = await getActiveAcademicTerm()`. If `user.role === "student" && user.studentStatus !== "alumni" && user.verifiedAcademicTerm !== activeAcademicTerm`, return `403` with `{ error: `Academic term verification required for ${activeAcademicTerm} before submitting new document requests.` }`.

---

### Task 4: Frontend System Settings Context & Dynamic Term Display

**Files:**
- Create: `frontend/src/api/settings.ts`
- Create: `frontend/src/api/accountUpdates.ts`
- Create: `frontend/src/provider/SystemSettingsProvider.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/components/dashboard/DashboardHeader.tsx`
- Modify: `frontend/src/components/auth/RegistrationForm.tsx`
- Modify: `frontend/src/components/auth/LoginHeader.tsx`
- Modify: `frontend/src/components/landing/AnnouncementBar.tsx`

**Step 1: Create `SystemSettingsProvider` and `useSystemSettings` hook**

Fetches `GET /api/settings` on mount (defaulting to `ACTIVE_ACADEMIC_TERM` while loading) and exposes `{ activeAcademicTerm, updateTerm, refreshSettings }`. Wire `SystemSettingsProvider` in `App.tsx` so public (`LandingPage`, `Login`, `Signup`) and authenticated (`Home`, `DashboardHeader`, `Accounts`) views all display the live `activeAcademicTerm`.

---

### Task 5: Student Academic Term Verification Banner, Modal & `/new-request` Gate

**Files:**
- Create: `frontend/src/components/home/AcademicTermUpdateBanner.tsx`
- Create: `frontend/src/components/home/AcademicTermUpdateDialog.tsx`
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/pages/NewRequest.tsx`

**Step 1: Build `AcademicTermUpdateBanner` & `AcademicTermUpdateDialog`**

- Shown to students when `user.role === "student" && user.studentStatus !== "alumni" && user.verifiedAcademicTerm !== activeAcademicTerm`.
- Displays 3 states:
  1. **Unverified (No request or previous term):** Prompts student to verify academic standing for `{activeAcademicTerm}` with a "Verify Academic Term" button.
  2. **Pending Review:** Shows badge `"Verification Pending Review"` with submitted standing and COR file name.
  3. **Rejected:** Displays rejection reason from Registrar/Admin and a `"Resubmit Verification"` button.
- In `AcademicTermUpdateDialog`:
  - Selects for `studentStatus` (`regular`, `irregular`, `graduating`, `alumni`), `yearLevel` (1–6, disabled/cleared when `alumni`), `section` (text input, disabled/cleared when `alumni`), and file input for **Certificate of Registration (COR) Proof** (or **Graduation / Alumni Proof** when `alumni` is selected).
- In `NewRequest.tsx`:
  - If the student is unverified for `activeAcademicTerm`, render the `AcademicTermUpdateBanner` gate card instead of the request wizard so they can submit or track their verification right there.

---

### Task 6: Admin & Registrar (`OUR`) Review Queue + Active Academic Term Control on `/accounts`

**Files:**
- Create: `frontend/src/components/accounts/AccountUpdatesTab.tsx`
- Create: `frontend/src/components/accounts/AcademicTermSettingsDialog.tsx`
- Modify: `frontend/src/pages/Accounts.tsx`
- Modify: `frontend/src/components/accounts/AccountsHeader.tsx`
- Modify: `frontend/src/components/sidebar/AppSidebar.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Allow `OUR` staff and `admin` into `/accounts`**

- In `App.tsx` and `AppSidebar.tsx`, allow `/accounts` for `admin` and `OUR` (`registrar`) staff.
- For `admin`: show tabs `"User Directory"` and `"Term Update Requests"`, plus an `"Active Term: {activeAcademicTerm}"` button in `AccountsHeader` to update the active term.
- For `OUR` staff: show `"Term Update Requests"` directly.

**Step 2: Build `AccountUpdatesTab`**

- Displays student name, student ID, college/course, Academic Term, Previous → Requested (`yearLevel`, `section`, `studentStatus`), `Preview Proof` button (opening `FilePreviewDialog` from ADR-0001 for In-Situ Proof Preview), status badge, and `Approve` / `Reject` actions.
- Rejection dialog includes **Canned Reason Presets**:
  - `"Blurred or unreadable Certificate of Registration (COR) image."`
  - `"Uploaded COR does not match the active academic term."`
  - `"Requested year level or section does not match the uploaded COR."`
  - `"Invalid or incomplete graduation proof for alumni status."`

