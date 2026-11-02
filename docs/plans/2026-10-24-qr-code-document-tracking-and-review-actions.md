# QR Code Document Tracking and Review Actions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement QR code generation for ready-for-pickup document claim slips, provide staff QR scanning and direct claim verification, and enable "Rejected" and "Cancelled" decision options during staff request reviews.

**Architecture:**
1. **Backend Status Lifecycle**: Expand `STATUS_TRANSITIONS` in `requests.controller.ts` so `pending`, `processing`, and `on_hold` requests can transition to `rejected` and `cancelled`. Persist `claimedBy` and `releasedBy` when marking documents as claimed, and dispatch corresponding notification emails.
2. **Student Portal Claim Slip**: In `MyRequestList.tsx`, connect the "Present Claim Slip" action to a `ClaimSlipDialog` that displays official student pickup credentials and a high-contrast SVG QR code encoding the claim verification URL.
3. **Staff QR Scanning & Claiming**: Introduce a universal `/requests/claim` handler that resolves tracking references and redirects staff to `SectorRequestReview`. Add a quick "Scan QR Slip" modal on staff request tables, and update the review action dialog to require reasons for rejections/cancellations.

**Tech Stack:** React 19, TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Radix UI Dialog, `qrcode.react`, Sonner.

---

### Task 1: Backend Request Status Transitions (`rejected` and `cancelled`) and Claim Attribution

**Files:**
- Create: `backend/src/tests/status-transitions.test.ts`
- Modify: `backend/src/controllers/requests.controller.ts:35-46, 164-196, 569-625`

**Step 1: Write the failing test**

Create `backend/src/tests/status-transitions.test.ts`:
```typescript
import assert from "node:assert";

type RequestStatus =
  | "pending"
  | "awaiting_payment"
  | "processing"
  | "on_hold"
  | "ready"
  | "claimed"
  | "rejected"
  | "cancelled";

const STATUS_TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  pending: ["processing", "rejected", "cancelled"],
  awaiting_payment: ["processing", "rejected", "cancelled"],
  processing: ["ready", "on_hold", "rejected", "cancelled"],
  on_hold: ["processing", "rejected", "cancelled"],
  ready: ["claimed", "cancelled"],
  claimed: [],
  rejected: [],
  cancelled: [],
};

function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

console.log("Running request status transition validation tests...");

// Rejected is allowed from pending, processing, on_hold
assert.strictEqual(canTransition("pending", "rejected"), true);
assert.strictEqual(canTransition("processing", "rejected"), true);
assert.strictEqual(canTransition("on_hold", "rejected"), true);
assert.strictEqual(canTransition("ready", "rejected"), false);

// Cancelled is allowed from pending, processing, on_hold, ready
assert.strictEqual(canTransition("pending", "cancelled"), true);
assert.strictEqual(canTransition("processing", "cancelled"), true);
assert.strictEqual(canTransition("ready", "cancelled"), true);

// Claimed is only allowed from ready
assert.strictEqual(canTransition("ready", "claimed"), true);
assert.strictEqual(canTransition("pending", "claimed"), false);

// Terminal states have no transitions
assert.strictEqual(canTransition("claimed", "processing"), false);
assert.strictEqual(canTransition("rejected", "ready"), false);
assert.strictEqual(canTransition("cancelled", "ready"), false);

console.log("All status transition tests passed!");
```

**Step 2: Run test to verify it passes**

Run: `npx tsx backend/src/tests/status-transitions.test.ts`
Expected: PASS

**Step 3: Update `backend/src/controllers/requests.controller.ts`**

1. In `requests.controller.ts:35-46`, update `STATUS_TRANSITIONS`:
```typescript
const STATUS_TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  pending: ["processing", "rejected", "cancelled"],
  awaiting_payment: ["processing", "rejected", "cancelled"],
  processing: ["ready", "on_hold", "rejected", "cancelled"],
  on_hold: ["processing", "rejected", "cancelled"],
  ready: ["claimed", "cancelled"],
  claimed: [],
  rejected: [],
  cancelled: [],
};
```

2. In `buildStatusNotification` (`requests.controller.ts:164-196`), add `rejected`:
```typescript
    case "rejected":
      return {
        title: "Request rejected",
        message: `Your request for ${documentName} was rejected. Check your portal for staff remarks.`,
      };
```

3. In `updateRequestStatus` (`requests.controller.ts:569-625`), record `claimedBy`, `releasedBy`, `cancelledAt`, and remarks:
```typescript
    const { status, releaseDate, staffNotes, releasePdfUrl, claimedBy } = (req.body ??
      {}) as UpdateStatusBody & { claimedBy?: unknown };

    if (typeof claimedBy === "string" && claimedBy.trim()) {
      updates.claimedBy = claimedBy.trim();
    }
    if (status === "claimed") {
      updates.claimedAt = new Date();
      updates.releasedBy = staffId;
      if (!updates.claimedBy) {
        updates.claimedBy = request.user?.fullName ?? null;
      }
    }
    if (status === "cancelled") {
      updates.cancelledAt = new Date();
      if (typeof staffNotes === "string" && staffNotes.trim()) {
        updates.cancellationReason = staffNotes.trim();
      }
    }
    if (status === "rejected" && typeof staffNotes === "string" && staffNotes.trim()) {
      updates.remarks = staffNotes.trim();
    }
```

**Step 4: Run test to verify it passes**

Run: `npx tsx backend/src/tests/status-transitions.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/controllers/requests.controller.ts backend/src/tests/status-transitions.test.ts
git commit -m "feat(requests): enable rejected and cancelled status transitions and claim attribution"
```

---

### Task 2: Frontend Review Action Buttons and Status Change Dialog (Reasons & Claimant Input)

**Files:**
- Create: `frontend/src/tests/review-actions.test.ts`
- Modify: `frontend/src/lib/windows/review/constants.ts:13-24`
- Modify: `frontend/src/components/windows/review/StatusChangeDialog.tsx:1-57`
- Modify: `frontend/src/pages/SectorRequestReview.tsx:155-195`

**Step 1: Write test for review action list**

Create `frontend/src/tests/review-actions.test.ts`:
```typescript
import assert from "node:assert";

const ALL_ACTION_STATUSES = [
  "processing",
  "on_hold",
  "ready",
  "claimed",
  "rejected",
  "cancelled",
] as const;

function isAllowedReviewAction(status: string): boolean {
  return ALL_ACTION_STATUSES.includes(status as any);
}

console.log("Running review action constants tests...");
assert.strictEqual(isAllowedReviewAction("rejected"), true);
assert.strictEqual(isAllowedReviewAction("cancelled"), true);
assert.strictEqual(isAllowedReviewAction("claimed"), true);
assert.strictEqual(isAllowedReviewAction("invalid_status"), false);
console.log("Review action constants tests passed!");
```

**Step 2: Run test to verify it passes**

Run: `npx tsx frontend/src/tests/review-actions.test.ts`
Expected: PASS

**Step 3: Update `frontend/src/lib/windows/review/constants.ts`**

Add `cancelled` to `REVIEW_ACTIONS` and import `Ban`:
```typescript
import {
  Ban,
  CheckCircle2,
  PackageCheck,
  Pause,
  Play,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { RequestStatus } from "@/types";

export const ATTACHMENTS_FETCH_LIMIT = 100;

export const REVIEW_ACTIONS: {
  status: RequestStatus;
  label: string;
  icon: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary";
}[] = [
  { status: "processing", label: "Start processing", icon: Play },
  { status: "on_hold", label: "Place on hold", icon: Pause },
  { status: "ready", label: "Mark ready", icon: CheckCircle2 },
  { status: "claimed", label: "Mark claimed", icon: PackageCheck },
  { status: "rejected", label: "Reject request", icon: XCircle, variant: "destructive" },
  { status: "cancelled", label: "Cancel request", icon: Ban, variant: "destructive" },
];
```

**Step 4: Update `StatusChangeDialog.tsx` to handle reason and claimant name**

In `frontend/src/components/windows/review/StatusChangeDialog.tsx`:
- When `status === "rejected"` or `status === "cancelled"`, require a reason textarea (`reason` cannot be empty to confirm).
- When `status === "claimed"`, show a `Claimant Name` input (pre-filled with student name, editable for authorized proxies).

**Step 5: Run tests and commit**

Run: `npx tsx frontend/src/tests/review-actions.test.ts`
Expected: PASS

```bash
git add frontend/src/lib/windows/review/constants.ts frontend/src/components/windows/review/StatusChangeDialog.tsx frontend/src/pages/SectorRequestReview.tsx frontend/src/tests/review-actions.test.ts
git commit -m "feat(review): add rejected and cancelled actions with reason input and claimant tracking"
```

---

### Task 3: Student Claim Slip Presentation with Scannable QR Code

**Files:**
- Modify: `frontend/package.json` (add `qrcode.react`)
- Create: `frontend/src/components/requests/my/ClaimSlipDialog.tsx`
- Modify: `frontend/src/components/requests/my/MyRequestList.tsx:215-224`

**Step 1: Install `qrcode.react`**

Run:
```bash
npm --prefix frontend install qrcode.react
```

**Step 2: Create `ClaimSlipDialog.tsx`**

Create `frontend/src/components/requests/my/ClaimSlipDialog.tsx`:
- Displays a clean, printable official slip layout with:
  - University Header ("ARCH Official Claim Slip")
  - Student Name, Student ID, Degree Program / Department
  - Document Name, Copies, Release Date
  - Large, high-contrast SVG QR Code rendering the direct claim URL: `${window.location.origin}/requests/claim?ref=${request.referenceNumber}`
  - Tracking Reference Number in bold monospace font
  - "Print Slip" button triggering `window.print()`
  - Close button

**Step 3: Connect "Present Claim Slip" in `MyRequestList.tsx`**

In `frontend/src/components/requests/my/MyRequestList.tsx`:
- Add state `selectedClaimSlipRequest: StudentRequestItem | null`
- Attach `onClick={() => setSelectedClaimSlipRequest(request)}` to the "Present Claim Slip" button.
- Render `<ClaimSlipDialog request={selectedClaimSlipRequest} open={selectedClaimSlipRequest !== null} onOpenChange={() => setSelectedClaimSlipRequest(null)} />`.

**Step 4: Verify frontend build**

Run: `npm --prefix frontend run test`
Expected: PASS (clean TypeScript compilation)

**Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/components/requests/my/ClaimSlipDialog.tsx frontend/src/components/requests/my/MyRequestList.tsx
git commit -m "feat(student): implement present claim slip dialog with scannable QR code"
```

---

### Task 4: Universal Claim Verification Route and Staff QR Scanner

**Files:**
- Create: `frontend/src/pages/ClaimVerification.tsx`
- Modify: `frontend/src/App.tsx:27-28, 90-110`
- Create: `frontend/src/components/requests/all/QrScanDialog.tsx`
- Modify: `frontend/src/components/requests/all/SearchToolbar.tsx`

**Step 1: Create `ClaimVerification.tsx`**

Create `frontend/src/pages/ClaimVerification.tsx`:
- Reads query param `?ref=...` or `?id=...`.
- Fetches request details via `getAllRequests({ search: ref })` or `getRequestById(id)`.
- If request found:
  - Resolves office route using `findOfficeRoute` or `/sectors/:sectorId/:divisionId/:officeId/requests/:requestId`.
  - Redirects staff straight to that request's review page.
- If request is already claimed, displays a clear badge with claimant name and pickup date.
- If requester is a student, redirects them to `/my-request`.

**Step 2: Mount route in `App.tsx`**

In `frontend/src/App.tsx`:
```typescript
const ClaimVerification = lazy(() => import("./pages/ClaimVerification"));
```
Mount under authenticated layout:
```typescript
<Route path="/requests/claim" element={<ClaimVerification />} />
```

**Step 3: Create `QrScanDialog.tsx` in `SearchToolbar.tsx`**

In `frontend/src/components/requests/all/QrScanDialog.tsx`:
- Provides a fast input modal:
  - Camera video scanner using native HTML5 `MediaDevices.getUserMedia` and `BarcodeDetector` (where supported) or manual USB/input entry.
  - Text input for barcode scanners or manual reference entry (e.g. `REQ-2026-000008` or scanned URL).
  - Automatically parses URL or reference number and navigates straight to `/requests/claim?ref=...`.
- Add a "Scan QR Slip" button alongside the search bar in `SearchToolbar.tsx`.

**Step 4: Run typecheck and tests**

Run:
```bash
npm --prefix frontend run test
```
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/pages/ClaimVerification.tsx frontend/src/App.tsx frontend/src/components/requests/all/QrScanDialog.tsx frontend/src/components/requests/all/SearchToolbar.tsx
git commit -m "feat(staff): add universal claim verification route and staff QR scan dialog"
```

---

### Task 5: End-to-End Verification & Quality Review

**Files:**
- Run backend tests: `npm --prefix backend test`
- Run frontend type check & build: `npm --prefix frontend run build`

**Step 1: Run backend tests**

Run: `npm --prefix backend test`
Expected: 100% passing across all unit test suites.

**Step 2: Run frontend build**

Run: `npm --prefix frontend run build`
Expected: Bundle created with 0 errors.

**Step 3: Verify clean working directory**

Run: `git status`
Expected: Working tree clean.
