# Staff Office-Scoped Document Manager & Admin-Only Accounts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restrict Accounts (`/accounts`, user directory, and Academic Term Verification COR reviews) to Admins only, and scope the Document Manager so Office Staff only see and manage documents assigned to their Processing Office.

**Architecture:** Frontend and backend role gates on `canAccessAccounts` and `/api/account-updates` are tightened to `admin`-only, updating ADR-0005 Decision #4 accordingly. For the Document Manager, the shared `DocumentProvider` remains unfiltered because `"staff"` is included in `REQUESTER_ROLES` and requester flows (`/home` `AvailableDocuments` and `/new-request` `DocumentGrid`) must still display the full school catalog; instead, pure office-matching helpers filter `DocumentCards` and `DocumentTable`, hide catalog-wide create/delete controls from staff in `DocumentHeader` and `EditDocument`, add an authenticated office-scoped backend endpoint (`GET /api/documents/scoped`), and guard `PATCH /api/documents/:id` by Processing Office while keeping `POST` and `DELETE` admin-only.

**Tech Stack:** TypeScript, React, Express, Drizzle ORM, Node `node:assert/strict` via `tsx`.

> _Contradicts ADR-0005 (`docs/adr/0005-academic-term-verification-and-system-settings.md`, Decision #4), worth reopening because only Admins should manage accounts._

---

## Key Invariants & Edge Cases

- **Never filter `DocumentProvider` globally:** `AppLayout.tsx` wraps `<Outlet />` in `DocumentProvider`, which feeds both `DocumentManager` and requester views (`AvailableDocuments.tsx`, `DocumentGrid.tsx`). Filtering inside `DocumentProvider` would block staff from requesting documents from other offices.
- **Resolve Processing Office accurately:** In `backend/src/db/schema.ts`, `documentTypes.office` defaults to `"registrar"`. Non-`OUR` offices such as `OVPAF`, `CO`, or `COL` may carry legacy `office: "registrar"` while having a distinct `officeId` / `officeRecord.code` and `code` prefix (e.g., `OVPAF-002`). Always resolve office code in this priority order:
  1. `officeRecord.code` (trimmed, uppercased)
  2. Prefix before `"-"` in `doc.code` (e.g., `"OUR-001"` -> `"OUR"`, `"HRMO-001"` -> `"HRMO"`, `"OVPAF-002"` -> `"OVPAF"`)
  3. Legacy `office` enum fallback ONLY when neither `officeRecord.code` nor a `code` prefix is available (`"hr"` -> `"HRMO"`, `"registrar"` -> `"OUR"`).
- **UUID matching when both IDs exist:** If both user and document have a non-empty `officeId` (or `officeRecord.id`), compare IDs directly (`docOfficeId === userOfficeId`). If either `officeId` is missing (legacy row before backfill), fall through to resolved office code matching. Staff with no resolved office fail closed (see zero documents).
- **Preserve `GET /api/users/:id` for staff:** `backend/src/routes/users.routes.ts` already restricts `GET /`, `PATCH /:id`, and `DELETE /:id` to `requireRoles("admin")`, while allowing `admin, staff` on `GET /:id` (used by `ProfileTrigger`). Do not break `GET /:id`.

---

### Task 1: Restrict Frontend Accounts Access to Admin Only

**Files:**
- Modify: `frontend/src/tests/role-access.test.ts`
- Modify: `frontend/src/lib/navigation/role-access.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/Accounts.tsx`
- Modify: `docs/adr/0005-academic-term-verification-and-system-settings.md`

**Step 1: Update `canAccessAccounts` assertions to expect `false` for all staff (including `OUR` Registrar staff)**

In `frontend/src/tests/role-access.test.ts` (around lines 20–43), update the `canAccessAccounts` expectations so `admin` returns `true` and `OUR` Registrar staff returns `false` alongside `HRMO` staff, students, and teachers:

```ts
assert.equal(
  canAccessAccounts({ role: "admin", office: null, officeRecord: null }),
  true,
);
assert.equal(
  canAccessAccounts({
    role: "staff",
    office: null,
    officeRecord: { id: "uuid-1", code: "OUR", name: "Office of the University Registrar" },
  }),
  false,
);
assert.equal(
  isRegistrarStaff({ role: "staff", office: "registrar", officeRecord: null }),
  true,
);
assert.equal(
  canAccessAccounts({
    role: "staff",
    office: "hr",
    officeRecord: { id: "uuid-2", code: "HRMO", name: "Human Resource Management Office" },
  }),
  false,
);
assert.equal(
  canAccessAccounts({ role: "student", office: null, officeRecord: null }),
  false,
);
assert.equal(
  canAccessAccounts({ role: "teacher", office: null, officeRecord: null }),
  false,
);
```

**Step 2: Run the test to verify it fails**

Run:
```bash
cd frontend && npx tsx src/tests/role-access.test.ts
```
Expected: FAIL on `canAccessAccounts` returning `true` instead of `false` for the `OUR` Registrar staff test case.

**Step 3: Implement admin-only `canAccessAccounts` and tighten routes/UI/ADR**

1. In `frontend/src/lib/navigation/role-access.ts` (lines 20–22), simplify `canAccessAccounts` to admin-only:

```ts
export function canAccessAccounts(user: Pick<AuthUser, "role" | "office" | "officeRecord">): boolean {
  return user.role === "admin";
}
```

Inspect `getStaffWorkspaceLink` in the same file to confirm it never routes staff to `/accounts` (leave `isRegistrarStaff` intact unless unused elsewhere). Because `AppSidebar.tsx` and `CommandMenu.tsx` already gate `/accounts` with `canAccessAccounts(user)`, sidebar and command-palette entries for `/accounts` are automatically hidden from all staff.

2. In `frontend/src/App.tsx` (lines 102–112), import `ADMIN_ROLES` from `@/lib/navigation/role-access` (if not already imported) and tighten the `/accounts` route guard from `STAFF_ROLES` to `ADMIN_ROLES`:

```tsx
<Route
  path="/accounts"
  element={
    <RequireRole allowedRoles={ADMIN_ROLES} checkAccess={canAccessAccounts}>
      <Accounts />
    </RequireRole>
  }
/>
```

3. In `frontend/src/pages/Accounts.tsx` (lines 22–73), remove any non-admin staff fallback branch that rendered Term Update Requests alone for `OUR` staff; keep the early guard returning `null` when `!user || !canAccessAccounts(user)`, and render the full Admin Accounts tabs (`User Directory` + `Term Update Requests`).

4. In `docs/adr/0005-academic-term-verification-and-system-settings.md` (Decision #4), amend the decision note to state that access to `/accounts` and Academic Term Verification COR reviews is restricted exclusively to `admin` users (`staff`, including `OUR` Registrar staff, no longer have access).

**Step 4: Run the test to verify it passes**

Run:
```bash
cd frontend && npx tsx src/tests/role-access.test.ts
```
Expected: PASS (exit code 0).

**Step 5: Commit**

```bash
git add frontend/src/tests/role-access.test.ts frontend/src/lib/navigation/role-access.ts frontend/src/App.tsx frontend/src/pages/Accounts.tsx docs/adr/0005-academic-term-verification-and-system-settings.md
git commit -m "feat(auth): restrict frontend accounts access to admins only"
```

---

### Task 2: Restrict Backend Account Update Reviews & Guards to Admin Only

**Files:**
- Modify: `backend/src/tests/academic-term-verification.test.ts`
- Modify: `backend/src/lib/term-standing.ts`
- Modify: `backend/src/controllers/accountUpdates.controller.ts`
- Modify: `backend/src/routes/accountUpdates.routes.ts`

**Step 1: Add failing unit tests for `canUserReviewAccountUpdates`**

In `backend/src/tests/academic-term-verification.test.ts`, import `canUserReviewAccountUpdates` from `../lib/term-standing.js` and append assertions matching the file's existing assertion style:

```ts
import {
  buildApprovedStandingPatch,
  canUserReviewAccountUpdates,
  needsAcademicTermVerification,
  validateRequestedStanding,
} from "../lib/term-standing.js";
```

Add checks verifying only `"admin"` is permitted:

```ts
assert.equal(canUserReviewAccountUpdates({ role: "admin" }), true);
assert.equal(canUserReviewAccountUpdates({ role: "staff" }), false);
assert.equal(canUserReviewAccountUpdates({ role: "student" }), false);
assert.equal(canUserReviewAccountUpdates({ role: "teacher" }), false);
assert.equal(canUserReviewAccountUpdates(null), false);
assert.equal(canUserReviewAccountUpdates(undefined), false);
```

**Step 2: Run the test to verify it fails**

Run:
```bash
cd backend && npx tsx src/tests/academic-term-verification.test.ts
```
Expected: FAIL because `term-standing.ts` does not export `canUserReviewAccountUpdates`.

**Step 3: Implement `canUserReviewAccountUpdates` and enforce admin-only routes**

1. In `backend/src/lib/term-standing.ts` (append after line 75):

```ts
export function canUserReviewAccountUpdates(
  user: { role?: string | null } | null | undefined,
): boolean {
  return user?.role === "admin";
}
```

2. In `backend/src/controllers/accountUpdates.controller.ts` (lines 35–59), import `canUserReviewAccountUpdates` from `../lib/term-standing.js` and replace the `user.role === "staff"` / `registrar` / `OUR` office check inside `canReviewAccountUpdates(userId)`:

```ts
export async function canReviewAccountUpdates(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });
  return canUserReviewAccountUpdates(user);
}
```

3. In `backend/src/routes/accountUpdates.routes.ts`, inspect the admin review/listing routes (`GET /` queue and `PATCH /:id/review` or equivalent decision route) and attach `requireRoles("admin")` middleware so staff receive HTTP `403` at the router layer as well as the controller guard, while keeping requester submission/status routes open to students.

4. Leave `backend/src/routes/users.routes.ts` unchanged (`GET /`, `PATCH /:id`, `DELETE /:id` are already `requireRoles("admin")`, and `GET /:id` must remain open to `admin, staff` for `ProfileTrigger`).

**Step 4: Run the test to verify it passes**

Run:
```bash
cd backend && npx tsx src/tests/academic-term-verification.test.ts
```
Expected: PASS (exit code 0).

**Step 5: Commit**

```bash
git add backend/src/tests/academic-term-verification.test.ts backend/src/lib/term-standing.ts backend/src/controllers/accountUpdates.controller.ts backend/src/routes/accountUpdates.routes.ts
git commit -m "feat(auth): restrict account update reviews to admins only"
```

---

### Task 3: Frontend Office-Scoped Document Manager Filtering & Action Guards

**Files:**
- Create: `frontend/src/tests/document-office-scope.test.ts`
- Modify: `frontend/src/lib/documents/documents.ts`
- Modify: `frontend/src/components/documents/DocumentCards.tsx`
- Modify: `frontend/src/components/documents/DocumentTable.tsx`
- Modify: `frontend/src/components/documents/DocumentHeader.tsx`
- Modify: `frontend/src/components/documents/EditDocument.tsx`
- Modify: `frontend/package.json`

**Step 1: Write the failing test for frontend office scoping**

Create `frontend/src/tests/document-office-scope.test.ts`:

```ts
import assert from "node:assert/strict";
import {
  filterDocumentsForManager,
  isDocumentInStaffOffice,
  resolveDocumentOfficeCode,
  resolveStaffOfficeCode,
} from "../lib/documents/documents.ts";

assert.equal(
  resolveDocumentOfficeCode({
    code: "OVPAF-002",
    office: "registrar",
    officeRecord: { id: "ovpaf-id", code: "OVPAF", name: "VP for Admin & Finance", sector: "admin" },
  }),
  "OVPAF",
);

// Legacy fallback ignores misleading default office: "registrar" when code prefix specifies OVPAF
assert.equal(
  resolveDocumentOfficeCode({
    code: "OVPAF-002",
    office: "registrar",
    officeRecord: null,
  }),
  "OVPAF",
);

assert.equal(
  resolveDocumentOfficeCode({
    code: "LEGACY",
    office: "hr",
    officeRecord: null,
  }),
  "HRMO",
);

assert.equal(
  resolveStaffOfficeCode({
    role: "staff",
    office: "registrar",
    officeRecord: { id: "our-id", code: "OUR", name: "Registrar", sector: "academic" },
  }),
  "OUR",
);

const ourStaff = {
  role: "staff" as const,
  office: "registrar" as const,
  officeId: "uuid-our",
  officeRecord: { id: "uuid-our", code: "OUR", name: "Office of the University Registrar", sector: "academic" },
};

const hrmoStaff = {
  role: "staff" as const,
  office: "hr" as const,
  officeId: "uuid-hrmo",
  officeRecord: { id: "uuid-hrmo", code: "HRMO", name: "Human Resource Management Office", sector: "admin" },
};

const unassignedStaff = {
  role: "staff" as const,
  office: null,
  officeId: null,
  officeRecord: null,
};

const adminUser = {
  role: "admin" as const,
  office: null,
  officeId: null,
  officeRecord: null,
};

const docs = [
  { id: "d1", code: "OUR-001", office: "registrar" as const, officeId: null, officeRecord: null },
  {
    id: "d2",
    code: "OVPAF-002",
    office: "registrar" as const,
    officeId: "uuid-ovpaf",
    officeRecord: { id: "uuid-ovpaf", code: "OVPAF", name: "OVPAF", sector: "admin" },
  },
  {
    id: "d3",
    code: "HRMO-001",
    office: "hr" as const,
    officeId: "uuid-hrmo",
    officeRecord: { id: "uuid-hrmo", code: "HRMO", name: "HRMO", sector: "admin" },
  },
];

assert.equal(isDocumentInStaffOffice(docs[0], ourStaff), true);
assert.equal(isDocumentInStaffOffice(docs[1], ourStaff), false);
assert.equal(isDocumentInStaffOffice(docs[2], ourStaff), false);
assert.equal(isDocumentInStaffOffice(docs[2], hrmoStaff), true);
assert.equal(isDocumentInStaffOffice(docs[0], unassignedStaff), false);
assert.equal(isDocumentInStaffOffice(docs[1], adminUser), true);

assert.deepEqual(
  filterDocumentsForManager(docs, ourStaff).map((d) => d.id),
  ["d1"],
);
assert.deepEqual(
  filterDocumentsForManager(docs, hrmoStaff).map((d) => d.id),
  ["d3"],
);
assert.deepEqual(
  filterDocumentsForManager(docs, adminUser).map((d) => d.id),
  ["d1", "d2", "d3"],
);
assert.deepEqual(filterDocumentsForManager(docs, unassignedStaff), []);
```

**Step 2: Run the test to verify it fails**

Run:
```bash
cd frontend && npx tsx src/tests/document-office-scope.test.ts
```
Expected: FAIL because `resolveDocumentOfficeCode`, `resolveStaffOfficeCode`, `isDocumentInStaffOffice`, and `filterDocumentsForManager` are not exported from `../lib/documents/documents.ts`.

**Step 3: Add office-scoping helpers and wire Document Manager views only (NOT `DocumentProvider`)**

1. In `frontend/src/lib/documents/documents.ts` (automatically re-exported via `frontend/src/lib/documents/index.ts`), add:

```ts
export interface DocumentOfficeTarget {
  code: string;
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeRecord?: { id?: string | null; code?: string | null } | null;
}

export interface StaffOfficeViewer {
  role: "student" | "teacher" | "admin" | "staff";
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeRecord?: { id?: string | null; code?: string | null } | null;
}

function legacyOfficeToCode(office?: "registrar" | "hr" | null): string | null {
  if (office === "hr") return "HRMO";
  if (office === "registrar") return "OUR";
  return null;
}

export function resolveDocumentOfficeCode(doc: DocumentOfficeTarget): string | null {
  const recordCode = doc.officeRecord?.code?.trim().toUpperCase();
  if (recordCode) return recordCode;

  const trimmedCode = doc.code?.trim() ?? "";
  const dashIdx = trimmedCode.indexOf("-");
  if (dashIdx > 0) {
    return trimmedCode.slice(0, dashIdx).toUpperCase();
  }

  return legacyOfficeToCode(doc.office);
}

export function resolveStaffOfficeCode(
  user: Pick<StaffOfficeViewer, "office" | "officeRecord"> | null | undefined,
): string | null {
  if (!user) return null;
  const recordCode = user.officeRecord?.code?.trim().toUpperCase();
  if (recordCode) return recordCode;
  return legacyOfficeToCode(user.office);
}

export function isDocumentInStaffOffice(
  doc: DocumentOfficeTarget,
  user: StaffOfficeViewer | null | undefined,
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "staff") return false;

  const docOfficeId = doc.officeId ?? doc.officeRecord?.id ?? null;
  const userOfficeId = user.officeId ?? user.officeRecord?.id ?? null;
  if (docOfficeId && userOfficeId) {
    return docOfficeId === userOfficeId;
  }

  const docCode = resolveDocumentOfficeCode(doc);
  const userCode = resolveStaffOfficeCode(user);
  return Boolean(docCode && userCode && docCode === userCode);
}

export function filterDocumentsForManager<T extends DocumentOfficeTarget>(
  documents: T[],
  user: StaffOfficeViewer | null | undefined,
): T[] {
  if (!user) return [];
  if (user.role === "admin") return documents;
  if (user.role !== "staff") return [];
  return documents.filter((doc) => isDocumentInStaffOffice(doc, user));
}
```

2. In `frontend/src/components/documents/DocumentCards.tsx` (lines 14–65):
   - Read `const { user } = useAuth();` (matching the existing `useAuth` import pattern in `Accounts.tsx` / `AppSidebar.tsx`).
   - Derive `const scopedDocuments = useMemo(() => filterDocumentsForManager(documents, user), [documents, user]);`.
   - Compute Total / Active / Inactive counts from `scopedDocuments` instead of raw `documents`.

3. In `frontend/src/components/documents/DocumentTable.tsx` (lines 14–242):
   - Read `const { user } = useAuth();`.
   - Derive `const scopedDocuments = useMemo(() => filterDocumentsForManager(documents, user), [documents, user]);`.
   - Slice/paginate and compute `totalPages` from `scopedDocuments` instead of raw `documents` (ensuring `currentPage` resets or clamps cleanly when filtering leaves fewer pages).
   - Ensure the empty-state message displays cleanly when an office has zero assigned documents.

4. In `frontend/src/components/documents/DocumentHeader.tsx` (lines 1–14):
   - Read `const { user } = useAuth();`.
   - Render `<DocumentDialog />` only when `user?.role === "admin"` so Office Staff cannot add new global catalog document types (matching backend `POST /api/documents` `requireRoles("admin")`). Update subtitle copy for staff to reflect their office's documents when `user?.role === "staff"`.

5. In `frontend/src/components/documents/EditDocument.tsx` (lines 51–101):
   - Read `const { user } = useAuth();`.
   - Render `<DocumentDeleteAlert />` only when `user?.role === "admin"` so Office Staff cannot delete document types (matching backend `DELETE /api/documents/:id` `requireRoles("admin")`), while retaining `Edit`, `Edit Fields`, and `Disable`/`Enable` for their own office's documents.

6. In `frontend/package.json` (line 9, `"test"` script):
   - Append `&& npx tsx src/tests/document-office-scope.test.ts` to the end of `"test"`.

**Step 4: Run tests to verify pass**

Run:
```bash
cd frontend && npx tsx src/tests/document-office-scope.test.ts && npm test
```
Expected: PASS on all frontend test scripts (exit code 0).

**Step 5: Commit**

```bash
git add frontend/src/tests/document-office-scope.test.ts frontend/src/lib/documents/documents.ts frontend/src/components/documents/DocumentCards.tsx frontend/src/components/documents/DocumentTable.tsx frontend/src/components/documents/DocumentHeader.tsx frontend/src/components/documents/EditDocument.tsx frontend/package.json
git commit -m "feat(documents): scope Document Manager to staff processing office"
```

---

### Task 4: Backend Office-Scoped Document Query & Update Guard

**Files:**
- Create: `backend/src/tests/document-office-scope.test.ts`
- Create: `backend/src/lib/document-office-scope.ts`
- Modify: `backend/src/controllers/documents.controller.ts`
- Modify: `backend/src/routes/documents.routes.ts`
- Modify: `backend/package.json`

**Step 1: Write the failing test for backend document office guards**

Create `backend/src/tests/document-office-scope.test.ts`:

```ts
import assert from "node:assert/strict";
import {
  canStaffManageDocument,
  hasCrossOfficeReassignmentAttempt,
  isDocumentInStaffOffice,
  resolveDocumentOfficeCode,
  resolveStaffOfficeCode,
} from "../lib/document-office-scope.js";

const ourStaff = {
  id: "staff-our",
  role: "staff" as const,
  office: "registrar" as const,
  officeId: "uuid-our",
  officeCode: "OUR",
};

const ovpafDoc = {
  id: "doc-ovpaf",
  code: "OVPAF-002",
  office: "registrar" as const,
  officeId: "uuid-ovpaf",
  officeCode: "OVPAF",
};

const ourLegacyDoc = {
  id: "doc-our-legacy",
  code: "OUR-001",
  office: "registrar" as const,
  officeId: null,
  officeCode: null,
};

const hrmoDoc = {
  id: "doc-hrmo",
  code: "HRMO-001",
  office: "hr" as const,
  officeId: "uuid-hrmo",
  officeCode: "HRMO",
};

const adminActor = {
  id: "admin-1",
  role: "admin" as const,
  office: null,
  officeId: null,
  officeCode: null,
};

assert.equal(resolveDocumentOfficeCode(ovpafDoc), "OVPAF");
assert.equal(resolveDocumentOfficeCode(ourLegacyDoc), "OUR");
assert.equal(resolveStaffOfficeCode(ourStaff), "OUR");

assert.equal(isDocumentInStaffOffice(ourLegacyDoc, ourStaff), true);
assert.equal(isDocumentInStaffOffice(ovpafDoc, ourStaff), false);
assert.equal(isDocumentInStaffOffice(hrmoDoc, ourStaff), false);
assert.equal(canStaffManageDocument(ourLegacyDoc, ourStaff), true);
assert.equal(canStaffManageDocument(hrmoDoc, ourStaff), false);
assert.equal(canStaffManageDocument(hrmoDoc, adminActor), true);
assert.equal(
  canStaffManageDocument(ourLegacyDoc, { id: "no-office", role: "staff", office: null, officeId: null, officeCode: null }),
  false,
);

// Staff cannot reassign officeId, legacy office enum, or code prefix to another office
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { fee: 150, processingDays: 5 }, ourStaff),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { officeId: "uuid-hrmo" }, ourStaff),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { office: "hr" }, ourStaff),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { code: "HRMO-999" }, ourStaff),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { code: "OUR-010" }, ourStaff),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { officeId: "uuid-hrmo", office: "hr" }, adminActor),
  false,
);
```

**Step 2: Run the test to verify it fails**

Run:
```bash
cd backend && npx tsx src/tests/document-office-scope.test.ts
```
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../lib/document-office-scope.js`.

**Step 3: Create `document-office-scope.ts` and wire backend routes & controller guards**

1. Create `backend/src/lib/document-office-scope.ts`:

```ts
export interface DocumentOfficeRef {
  code: string;
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeCode?: string | null;
}

export interface OfficeActorRef {
  id: string;
  role: "student" | "teacher" | "admin" | "staff";
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeCode?: string | null;
}

export interface DocumentUpdatePayloadRef {
  code?: unknown;
  office?: unknown;
  officeId?: unknown;
}

function legacyOfficeToCode(office?: "registrar" | "hr" | null): string | null {
  if (office === "hr") return "HRMO";
  if (office === "registrar") return "OUR";
  return null;
}

function extractPrefixCode(code?: string | null): string | null {
  const trimmed = code?.trim() ?? "";
  const dashIdx = trimmed.indexOf("-");
  if (dashIdx > 0) {
    return trimmed.slice(0, dashIdx).toUpperCase();
  }
  return null;
}

export function resolveDocumentOfficeCode(doc: DocumentOfficeRef): string | null {
  const explicit = doc.officeCode?.trim().toUpperCase();
  if (explicit) return explicit;
  const fromCode = extractPrefixCode(doc.code);
  if (fromCode) return fromCode;
  return legacyOfficeToCode(doc.office);
}

export function resolveStaffOfficeCode(
  actor: Pick<OfficeActorRef, "office" | "officeCode"> | null | undefined,
): string | null {
  if (!actor) return null;
  const explicit = actor.officeCode?.trim().toUpperCase();
  if (explicit) return explicit;
  return legacyOfficeToCode(actor.office);
}

export function isDocumentInStaffOffice(
  doc: DocumentOfficeRef,
  actor: OfficeActorRef | null | undefined,
): boolean {
  if (!actor) return false;
  if (actor.role === "admin") return true;
  if (actor.role !== "staff") return false;

  if (doc.officeId && actor.officeId) {
    return doc.officeId === actor.officeId;
  }

  const docCode = resolveDocumentOfficeCode(doc);
  const actorCode = resolveStaffOfficeCode(actor);
  return Boolean(docCode && actorCode && docCode === actorCode);
}

export function canStaffManageDocument(
  doc: DocumentOfficeRef,
  actor: OfficeActorRef | null | undefined,
): boolean {
  return isDocumentInStaffOffice(doc, actor);
}

export function hasCrossOfficeReassignmentAttempt(
  existingDoc: DocumentOfficeRef,
  patch: DocumentUpdatePayloadRef,
  actor: OfficeActorRef | null | undefined,
): boolean {
  if (!actor || actor.role === "admin") return false;
  if (actor.role !== "staff") return true;

  if (patch.officeId !== undefined) {
    const requestedOfficeId = typeof patch.officeId === "string" ? patch.officeId : null;
    if (actor.officeId && requestedOfficeId !== actor.officeId) {
      return true;
    }
    if (!actor.officeId && requestedOfficeId !== (existingDoc.officeId ?? null)) {
      return true;
    }
  }

  if (patch.office !== undefined && patch.office !== existingDoc.office) {
    return true;
  }

  if (typeof patch.code === "string") {
    const existingCode = resolveDocumentOfficeCode(existingDoc);
    const nextPrefix = extractPrefixCode(patch.code);
    if (existingCode && nextPrefix && nextPrefix !== existingCode) {
      return true;
    }
  }

  return false;
}
```

2. In `backend/src/routes/documents.routes.ts` (before `router.get("/:id", ...)` and lines 18–22):
   - Add an authenticated office-scoped listing route BEFORE `/:id` (so `:id` does not capture `/scoped`):
     ```ts
     router.get("/scoped", requireAuth, requireRoles("admin", "staff"), getOfficeScopedDocuments);
     ```
   - Keep public `GET /` and `GET /:id` untouched so `/home` and `/new-request` continue serving all documents to all requesters (including staff acting as requesters).
   - Update `PATCH /:id` from `requireRoles("admin")` to `requireRoles("admin", "staff")`, keeping `POST /` and `DELETE /:id` strictly `requireRoles("admin")`:
     ```ts
     router.post("/", requireRoles("admin"), createDocument);
     router.patch("/:id", requireRoles("admin", "staff"), validateId, updateDocumentType);
     router.delete("/:id", requireRoles("admin"), validateId, deleteDocumentById);
     ```

3. In `backend/src/controllers/documents.controller.ts`:
   - Add `getOfficeScopedDocuments`: reuse the `getAllDocument` filtering/office-enrichment query, resolve the authenticated user's `officeId` and `officeCode` (from `users` + `offices`), filter rows with `isDocumentInStaffOffice` when `req.user.role === "staff"` (admins receive all matching rows), and return the standard paginated payload.
   - Update `updateDocumentType` (`lines 172–237`):
     - Fetch `existing`'s `officeRecord` code (if `existing.officeId` is set) and, when `req.user?.role === "staff"`, load the actor's `{ id, role, office, officeId }` + office `code` from `offices`.
     - If `!canStaffManageDocument(existingWithOfficeCode, actor)`, return `res.status(403).json({ success: false, message: "You can only update document types assigned to your office." })`.
     - If `hasCrossOfficeReassignmentAttempt(existingWithOfficeCode, req.body, actor)`, return `res.status(403).json({ success: false, message: "Staff cannot reassign a document type to another office." })`.
     - Also strip `office` and `officeId` from the update set when `req.user?.role === "staff"` as defense-in-depth.

4. In `backend/package.json` (line 10, `"test"` script):
   - Append `&& tsx src/tests/document-office-scope.test.ts` to `"test"`.

**Step 4: Run targeted tests, full test suites, and production builds**

Run:
```bash
cd backend && npx tsx src/tests/document-office-scope.test.ts && npm run build && npm test
```
Expected: TypeScript build succeeds (`tsc` exits 0) and all backend tests PASS.

Run:
```bash
cd frontend && npm test && npm run build
```
Expected: all frontend tests PASS and Vite production build exits 0.

**Step 5: Commit**

```bash
git add backend/src/tests/document-office-scope.test.ts backend/src/lib/document-office-scope.ts backend/src/controllers/documents.controller.ts backend/src/routes/documents.routes.ts backend/package.json
git commit -m "feat(documents): enforce office-scoped document management in backend"
```
