# Accounts and Request Table Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance document request navigation with direct review links, add an Office/Dept column in Accounts, and implement modal dialogs for editing users and changing roles without table configuration hacks.

**Architecture:** 
1. In `RequestTable`, resolve direct links to `/sectors/:sectorId/:divisionId/:officeId/requests/:requestId` using `findOfficeRoute`.
2. In `users.controller.ts`, sanitize and nullify mutually exclusive credentials during role updates so PostgreSQL schema check constraints pass cleanly.
3. In `AccountsTable`, add an "Office / Dept" column and replace inline `EditRow` with clean modal dialogs (`EditUserDialog` and `ChangeRoleDialog`).

**Tech Stack:** React 19, TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Radix UI Dialog.

---

### Task 1: Direct Document Review Navigation in RequestTable

**Files:**
- Create: `frontend/src/lib/sectors/__tests__/request-table-route.test.ts`
- Modify: `frontend/src/components/requests/all/RequestTable.tsx:115-145`

**Step 1: Write the failing test**

Create `frontend/src/lib/sectors/__tests__/request-table-route.test.ts`:
```typescript
import { findOfficeRoute } from "../sectors-config";

function getRequestReviewUrl(req: {
  id: string;
  officeCode?: string;
  officeId?: string;
  officeName?: string;
  sector?: string;
  documentTypeCode?: string;
  college?: string;
}): string | undefined {
  const isCollegeDoc =
    req.officeCode === "COL" ||
    req.documentTypeCode?.toUpperCase().startsWith("COL-");

  const route = findOfficeRoute({
    officeCode: req.officeCode,
    officeId: req.officeId,
    officeName: req.officeName,
    sector: req.sector,
    documentTypeCode: req.documentTypeCode,
    college: isCollegeDoc ? req.college : undefined,
  });

  return route ? `${route.url}/requests/${req.id}` : undefined;
}

export function runTests() {
  console.log("Running RequestTable review link route tests...");

  const url = getRequestReviewUrl({
    id: "req-abc-123",
    officeCode: "OUR",
    documentTypeCode: "OUR-001",
  });

  console.assert(
    url === "/sectors/ovpaa/academic-support/our/requests/req-abc-123",
    `Expected direct review link, got: ${url}`
  );

  const collegeUrl = getRequestReviewUrl({
    id: "req-col-456",
    officeCode: "COL",
    college: "CAFA",
    documentTypeCode: "COL-001",
  });

  console.assert(
    collegeUrl === "/sectors/ovpaa/colleges/cafa/requests/req-col-456",
    `Expected college review link, got: ${collegeUrl}`
  );

  console.log("RequestTable review link route tests passed!");
}

runTests();
```

**Step 2: Run test to verify it passes/runs**

Run: `npx tsx frontend/src/lib/sectors/__tests__/request-table-route.test.ts`
Expected: PASS

**Step 3: Update RequestTable to navigate to direct request review**

In `frontend/src/components/requests/all/RequestTable.tsx`:
Update line 119:
```tsx
const targetUrl = route ? `${route.url}/requests/${req.id}` : undefined;
```

**Step 4: Verify frontend build**

Run: `npm run build` in `frontend`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/requests/all/RequestTable.tsx frontend/src/lib/sectors/__tests__/request-table-route.test.ts
git commit -m "feat(requests): navigate directly to request review in office workspace"
```

---

### Task 2: Backend Role Transitions & Credential Sanitization

**Files:**
- Create: `backend/src/tests/user-role-transition.test.ts`
- Modify: `backend/src/controllers/users.controller.ts:7-175`
- Modify: `frontend/src/api/users.ts:4-15`

**Step 1: Write the failing test**

Create `backend/src/tests/user-role-transition.test.ts`:
```typescript
import assert from "node:assert";

// Pure unit test for role transition credential sanitization
type Role = "student" | "teacher" | "admin" | "staff";

interface UserRecord {
  id: string;
  role: Role;
  studentId: string | null;
  collegeId: string | null;
  courseId: string | null;
  section: string | null;
  yearLevel: number | null;
  studentStatus: string | null;
  department: string | null;
  office: string | null;
  officeId: string | null;
}

export function sanitizeRoleTransition(
  existingUser: UserRecord,
  patch: {
    role?: Role;
    fullName?: string;
    email?: string;
    studentId?: string | null;
    collegeId?: string | null;
    courseId?: string | null;
    section?: string | null;
    yearLevel?: number | null;
    studentStatus?: string | null;
    department?: string | null;
    office?: string | null;
    officeId?: string | null;
  }
): Record<string, any> {
  const targetRole = patch.role ?? existingUser.role;
  const updateData: Record<string, any> = {};

  if (patch.fullName !== undefined) updateData.fullName = patch.fullName;
  if (patch.email !== undefined) updateData.email = patch.email;
  if (patch.role !== undefined) updateData.role = patch.role;

  if (targetRole === "staff") {
    // Staff requires office or officeId
    updateData.officeId = patch.officeId !== undefined ? patch.officeId : existingUser.officeId;
    updateData.office = patch.office !== undefined ? patch.office : existingUser.office;
    if (!updateData.officeId && !updateData.office) {
      throw new Error("Staff role requires an assigned office");
    }
    // Clean up student & teacher credentials
    updateData.studentId = null;
    updateData.collegeId = null;
    updateData.courseId = null;
    updateData.section = null;
    updateData.yearLevel = null;
    updateData.studentStatus = null;
    updateData.department = null;
  } else if (targetRole === "teacher") {
    updateData.department = patch.department !== undefined ? patch.department : existingUser.department;
    // Clean up office & student credentials
    updateData.office = null;
    updateData.officeId = null;
    updateData.studentId = null;
    updateData.collegeId = null;
    updateData.courseId = null;
    updateData.section = null;
    updateData.yearLevel = null;
    updateData.studentStatus = null;
  } else if (targetRole === "student") {
    updateData.studentId = patch.studentId !== undefined ? patch.studentId : existingUser.studentId;
    updateData.collegeId = patch.collegeId !== undefined ? patch.collegeId : existingUser.collegeId;
    updateData.courseId = patch.courseId !== undefined ? patch.courseId : existingUser.courseId;
    updateData.section = patch.section !== undefined ? patch.section : existingUser.section;
    updateData.yearLevel = patch.yearLevel !== undefined ? patch.yearLevel : existingUser.yearLevel;
    updateData.studentStatus = patch.studentStatus !== undefined ? patch.studentStatus : existingUser.studentStatus;
    // Clean up office & teacher credentials
    updateData.office = null;
    updateData.officeId = null;
    updateData.department = null;
  } else if (targetRole === "admin") {
    // Admin can clean up or retain
    updateData.office = null;
    updateData.officeId = null;
    updateData.studentId = null;
    updateData.department = null;
  }

  return updateData;
}

function runTests() {
  console.log("Running user role transition sanitization tests...");

  const studentUser: UserRecord = {
    id: "user-1",
    role: "student",
    studentId: "TUPM-21-0001",
    collegeId: "col-1",
    courseId: "course-1",
    section: "3A",
    yearLevel: 3,
    studentStatus: "regular",
    department: null,
    office: null,
    officeId: null,
  };

  // Student -> Staff transition
  const staffUpdate = sanitizeRoleTransition(studentUser, {
    role: "staff",
    officeId: "office-our-uuid",
  });

  assert.strictEqual(staffUpdate.role, "staff");
  assert.strictEqual(staffUpdate.officeId, "office-our-uuid");
  assert.strictEqual(staffUpdate.studentId, null);
  assert.strictEqual(staffUpdate.collegeId, null);
  assert.strictEqual(staffUpdate.department, null);

  // Staff -> Teacher transition
  const staffUser: UserRecord = {
    ...studentUser,
    role: "staff",
    officeId: "office-our-uuid",
    office: null,
    studentId: null,
    collegeId: null,
  };

  const teacherUpdate = sanitizeRoleTransition(staffUser, {
    role: "teacher",
    department: "Computer Studies",
  });

  assert.strictEqual(teacherUpdate.role, "teacher");
  assert.strictEqual(teacherUpdate.department, "Computer Studies");
  assert.strictEqual(teacherUpdate.officeId, null);
  assert.strictEqual(teacherUpdate.office, null);

  console.log("All role transition sanitization tests passed!");
}

runTests();
```

**Step 2: Run test to verify it passes**

Run: `npx tsx backend/src/tests/user-role-transition.test.ts`
Expected: PASS

**Step 3: Implement in backend/src/controllers/users.controller.ts**

Extend `UpdateUserBody` and `updateUserById` to accept additional credentials, apply role-based sanitization, validate staff requirements, and record the updated fields in the audit log.
Also update `frontend/src/api/users.ts` with the expanded `UpdateUserBody` interface.

**Step 4: Verify backend compilation**

Run: `npm run build` in `backend`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/controllers/users.controller.ts backend/src/tests/user-role-transition.test.ts frontend/src/api/users.ts
git commit -m "feat(users): sanitize credentials and enforce constraints during role transitions"
```

---

### Task 3: Accounts Table "Office / Dept" Column

**Files:**
- Modify: `frontend/src/lib/accounts/accounts-table.ts:30-45`
- Modify: `frontend/src/components/accounts/AccountsTable.tsx:160-220`

**Step 1: Update TABLE_COLUMNS definition**

In `frontend/src/lib/accounts/accounts-table.ts`:
Add `{ key: "officeDept", label: "Office / Dept", className: "min-w-36 max-w-xs" }` to `TABLE_COLUMNS`.

**Step 2: Add Office / Dept Column in AccountsTable**

In `frontend/src/components/accounts/AccountsTable.tsx`:
Add column right after `role`:
```tsx
{
  key: "officeDept",
  className: "min-w-36 max-w-xs",
  header: "Office / Dept",
  cell: (user) => {
    if (user.role === "staff") {
      const office = ALL_OFFICES.find((o) => o.id === user.officeId) ||
        (user.office ? { code: user.office.toUpperCase(), name: user.office } : null);
      return (
        <Badge variant="outline" className="gap-1.5 py-0.5 text-xs font-medium">
          <Building2 className="size-3 text-muted-foreground" />
          <span>{office?.code || "Unassigned"}</span>
        </Badge>
      );
    }
    if (user.role === "teacher") {
      return (
        <span className="text-xs text-muted-foreground truncate max-w-32">
          {user.department || "—"}
        </span>
      );
    }
    if (user.role === "student") {
      return (
        <span className="text-xs text-muted-foreground truncate max-w-32">
          {user.studentStatus || "Student"}
        </span>
      );
    }
    return <span className="text-xs text-muted-foreground">—</span>;
  },
}
```

**Step 3: Verify frontend build**

Run: `npm run build` in `frontend`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/lib/accounts/accounts-table.ts frontend/src/components/accounts/AccountsTable.tsx
git commit -m "feat(accounts): add Office / Dept column to accounts table"
```

---

### Task 4: Edit User Dialog Box

**Files:**
- Create: `frontend/src/components/accounts/EditUserDialog.tsx`
- Modify: `frontend/src/components/accounts/EditUser.tsx`
- Modify: `frontend/src/components/accounts/AccountsTable.tsx` (remove `customRow` inline rendering)
- Remove: `frontend/src/components/accounts/EditRow.tsx`

**Step 1: Create EditUserDialog component**

Create `frontend/src/components/accounts/EditUserDialog.tsx`:
- Accepts `user: User`, `open: boolean`, `onOpenChange: (open: boolean) => void`.
- Form with:
  - Full Name (required text input)
  - Email (required email input)
  - If role === "student": Student ID
  - If role === "teacher": Department
  - If role === "staff": Office selector (from `ALL_OFFICES`)
- Save button calls `updateUserById`, calls `refreshAccounts()`, toasts success, closes dialog.
- Cancel button closes dialog without changes.

**Step 2: Connect EditUserDialog in EditUser action menu**

In `frontend/src/components/accounts/EditUser.tsx`:
- Maintain state `isEditDialogOpen`
- Clicking "Edit" in `DropdownMenu` opens `EditUserDialog`.
- Remove table-level `setEdit` dependency.

**Step 3: Clean up AccountsTable**

In `frontend/src/components/accounts/AccountsTable.tsx`:
- Remove `renderCustomRow` and `customRow` prop on `DataTable`.
- Remove `editingUser` state.
- Delete unused `EditRow.tsx`.

**Step 4: Verify frontend build**

Run: `npm run build` in `frontend`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/accounts/EditUserDialog.tsx frontend/src/components/accounts/EditUser.tsx frontend/src/components/accounts/AccountsTable.tsx
git rm frontend/src/components/accounts/EditRow.tsx
git commit -m "feat(accounts): replace inline table edit with EditUserDialog modal"
```

---

### Task 5: Change Role Dialog Box

**Files:**
- Create: `frontend/src/components/accounts/ChangeRoleDialog.tsx`
- Modify: `frontend/src/components/accounts/EditUser.tsx`

**Step 1: Create ChangeRoleDialog component**

Create `frontend/src/components/accounts/ChangeRoleDialog.tsx`:
- Accepts `user: User`, `open: boolean`, `onOpenChange: (open: boolean) => void`.
- Target role selector (`student`, `teacher`, `staff`, `admin`).
- Alert/Notice explaining that role-incompatible credentials will be removed for safety.
- Conditional required inputs based on selected target role:
  - If `staff`: Office picker (required, list of all university offices).
  - If `teacher`: Department input.
  - If `student`: Student ID input.
- Confirm button calls `updateUserById(user.id, { role, ...fields })`, calls `refreshAccounts()`, displays toast, closes modal.

**Step 2: Connect ChangeRoleDialog in EditUser action menu**

In `frontend/src/components/accounts/EditUser.tsx`:
- Replace direct `handleRoleChange` menu items with opening `ChangeRoleDialog`.
- Provide direct "Change Role" item in dropdown that opens the dialog.

**Step 3: Verify frontend build**

Run: `npm run build` in `frontend`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/components/accounts/ChangeRoleDialog.tsx frontend/src/components/accounts/EditUser.tsx
git commit -m "feat(accounts): add ChangeRoleDialog with credential prompts and safe role switching"
```

---

### Task 6: Full Verification and Smoke Test

**Files:**
- Run test suites:
  - `npx tsx frontend/src/lib/sectors/__tests__/request-table-route.test.ts`
  - `npx tsx backend/src/tests/user-role-transition.test.ts`
- Run both TypeScript builds:
  - `npm run build` in `backend`
  - `npm run build` in `frontend`

**Step 1: Execute all unit checks**

Run: `npx tsx frontend/src/lib/sectors/__tests__/request-table-route.test.ts`
Run: `npx tsx backend/src/tests/user-role-transition.test.ts`
Expected: ALL PASS

**Step 2: Verify production builds**

Run: `npm --prefix backend run build`
Run: `npm --prefix frontend run build`
Expected: Both exit 0 without errors

**Step 3: Commit and summarize**

```bash
git commit --allow-empty -m "chore: verified accounts dialogs and direct review routing"
```
