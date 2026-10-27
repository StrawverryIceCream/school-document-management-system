# Track Timeline Dialog & Claim Slip Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide an in-page timeline and progress modal dialog (`RequestTimelineDialog`) on the student dashboard, resolving broken `/requests/:id/timeline` navigation and cleanly connecting claim slip presentation.

**Architecture:** Reuses existing request lifecycle metadata and step calculation helpers (`STATUS_CONFIGS`, `STEP_LABELS`, `getStepDates`, `formatRequestCardData`) to render a visual 4-step progress stepper and audit summary inside a Radix/shadcn `Dialog`. Integrates state management in `RequestTable.tsx` to seamlessly toggle between `RequestTimelineDialog` and the existing `ClaimSlipDialog` without page redirects.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Radix UI Dialog primitives, Node test runner.

---

### Task 1: Timeline Stepper & Status Mapping Unit Test

**Files:**
- Create: `frontend/src/tests/timeline-stepper.test.ts`
- Modify: `frontend/package.json`

**Step 1: Write the failing test**

```typescript
// frontend/src/tests/timeline-stepper.test.ts
import assert from "node:assert";
import {
  STATUS_CONFIGS,
  STEP_LABELS,
  PROGRESS_WIDTH_CLASSES,
  getStepDates,
} from "../lib/requests/my-requests.js";
import { formatRequestCardData } from "../lib/requests/request-card.js";
import type { TrackedRequest } from "../lib/requests/my-requests.js";

console.log("Running timeline stepper helper tests...");

// Verify 4 canonical steps
assert.strictEqual(STEP_LABELS.length, 4);
assert.deepStrictEqual([...STEP_LABELS], ["Filed", "Assessed", "Signatures", "Released"]);

// Verify status configs
assert.strictEqual(STATUS_CONFIGS.pending.completedSteps, 1);
assert.strictEqual(STATUS_CONFIGS.processing.completedSteps, 2);
assert.strictEqual(STATUS_CONFIGS.ready.completedSteps, 4);
assert.strictEqual(STATUS_CONFIGS.ready.canClaim, true);
assert.strictEqual(STATUS_CONFIGS.pending.canClaim, false);

// Verify step dates calculation
const mockRequest: TrackedRequest = {
  id: "test-uuid-1234",
  referenceNumber: "REQ-2026-000099",
  userId: "user-1",
  documentTypeId: "doc-1",
  documentName: "Transcript of Records",
  copies: 1,
  purpose: "Employment",
  status: "processing",
  amountDue: "150.00",
  createdAt: "2026-10-01T08:00:00.000Z",
  updatedAt: "2026-10-02T08:00:00.000Z",
  assessedAt: "2026-10-02T09:00:00.000Z",
  signedAt: null,
  claimedAt: null,
  releaseDate: "2026-10-10",
  releasePdfUrl: null,
};

const stepDates = getStepDates(mockRequest);
assert.strictEqual(stepDates.length, 4);
assert.notStrictEqual(stepDates[0], "—"); // Filed date
assert.notStrictEqual(stepDates[1], "—"); // Assessed date
assert.strictEqual(stepDates[2], "—");    // Signatures pending
assert.strictEqual(stepDates[3], "—");    // Not released yet

// Verify card formatting fallback
const formatted = formatRequestCardData(mockRequest);
assert.strictEqual(formatted.referenceNumber, "REQ-2026-000099");
assert.strictEqual(formatted.amountNumber, 150);

console.log("Timeline stepper helper tests passed!");
```

**Step 2: Run test to verify it fails**

Run: `node frontend/src/tests/timeline-stepper.test.ts`
Expected: Passes or fails if imports require resolution. Register in `frontend/package.json` `"test"`.

**Step 3: Register in package.json and run**

Update `frontend/package.json` test script to include `node src/tests/timeline-stepper.test.ts`.

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/package.json frontend/src/tests/timeline-stepper.test.ts
git commit -m "test(timeline): add unit tests for timeline stepper calculations"
```

---

### Task 2: Build `RequestTimelineDialog` Component

**Files:**
- Create: `frontend/src/components/requests/my/RequestTimelineDialog.tsx`

**Step 1: Write `RequestTimelineDialog.tsx`**

```tsx
import { Check, Clock, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import {
  formatClaimPeriod,
  formatRequestCardData,
  getStepDates,
  STATUS_CONFIGS,
  STEP_LABELS,
} from "@/lib/requests";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

interface RequestTimelineDialogProps {
  request: MyRequestWithDocumentName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenClaimSlip?: (request: MyRequestWithDocumentName) => void;
}

export function RequestTimelineDialog({
  request,
  open,
  onOpenChange,
  onOpenClaimSlip,
}: RequestTimelineDialogProps) {
  if (!request) return null;

  const config = STATUS_CONFIGS[request.status];
  const cardData = formatRequestCardData(request);
  const stepDates = getStepDates(request);
  const claimPeriod = formatClaimPeriod(request.releaseDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto gap-5 p-6">
        <DialogHeader className="gap-2 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <span className="font-mono text-sm font-bold text-primary">
              {cardData.referenceNumber}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                BADGE_BASE,
                "gap-1.5 px-2.5 py-0.5 text-xs",
                TONES[config.tone].badge,
              )}
            >
              <span className={cn("size-1.5 rounded-full", TONES[config.tone].dot)} />
              {config.label}
            </Badge>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {request.documentName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lifecycle progress and verification stages for your submitted scholastic record.
          </DialogDescription>
        </DialogHeader>

        {/* 4-Step Visual Stepper */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Progress Stages ({config.completedSteps} of {STEP_LABELS.length} Completed)
          </span>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {STEP_LABELS.map((label, index) => {
              const isCompleted = index < config.completedSteps;
              const isCurrent = index === config.completedSteps - 1 && request.status !== "ready" && request.status !== "claimed";
              const dateStr = stepDates[index];

              return (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border",
                      isCurrent && "ring-2 ring-primary/30 ring-offset-1 bg-primary/90 text-primary-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="size-4 stroke-[3]" /> : index + 1}
                  </div>
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {dateStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Processing Office</span>
            <p className="font-semibold text-foreground text-sm">{cardData.officeName}</p>
          </div>

          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Payment Status</span>
            <p className="font-semibold text-foreground text-sm">{cardData.paymentStatusText}</p>
          </div>

          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Target Release Date</span>
            <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              {request.releaseDate || "Pending assessment"}
            </p>
          </div>

          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Copies Requested</span>
            <p className="font-semibold text-foreground text-sm">
              {request.copies} {request.copies === 1 ? "Official Copy" : "Official Copies"}
            </p>
          </div>

          {request.purpose && (
            <div className="sm:col-span-2 bg-muted/20 border rounded-xl p-3 space-y-1">
              <span className="text-muted-foreground font-medium">Purpose</span>
              <p className="font-medium text-foreground">{request.purpose}</p>
            </div>
          )}

          {claimPeriod && (
            <div className="sm:col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Available for Counter Claiming</span>
              <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                Claim period: {claimPeriod}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between items-center gap-2 pt-2">
          {config.canClaim && onOpenClaimSlip ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onOpenClaimSlip(request)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              <QrCode className="size-4" />
              Present Claim Slip QR
            </Button>
          ) : <div />}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RequestTimelineDialog;
```

**Step 2: Run build to verify type checking**

Run: `tsc -b --noEmit` in `frontend`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/requests/my/RequestTimelineDialog.tsx
git commit -m "feat(timeline): create RequestTimelineDialog component with visual stepper"
```

---

### Task 3: Update `RequestActionButton` and Connect Dialogs in `RequestTable`

**Files:**
- Modify: `frontend/src/components/requests/my/RequestActionButton.tsx`
- Modify: `frontend/src/components/requests/my/RequestTable.tsx`

**Step 1: Refactor `RequestActionButton.tsx`**

- Update icons and button variants:
  - If `request.status === "ready"`, render "Claim Slip" button with `QrCode` icon.
  - Else, render "Track Timeline" button with `TrendingUp` icon.
- Maintain callback contracts `onTrackTimeline(request.id)` and `onClaimSlip(request.id)`.

**Step 2: Update `RequestTable.tsx`**

- Add state:
  ```tsx
  const [selectedTimelineRequest, setSelectedTimelineRequest] =
    useState<MyRequestWithDocumentName | null>(null);
  const [selectedClaimSlipRequest, setSelectedClaimSlipRequest] =
    useState<MyRequestWithDocumentName | null>(null);
  ```
- Wire callbacks:
  ```tsx
  onTrackTimeline={(id) => {
    const found = filteredRequests.find((r) => r.id === id);
    if (found) setSelectedTimelineRequest(found);
  }}
  onClaimSlip={(id) => {
    const found = filteredRequests.find((r) => r.id === id);
    if (found) setSelectedClaimSlipRequest(found);
  }}
  ```
- Render dialogs:
  ```tsx
  <RequestTimelineDialog
    request={selectedTimelineRequest}
    open={selectedTimelineRequest !== null}
    onOpenChange={(open) => !open && setSelectedTimelineRequest(null)}
    onOpenClaimSlip={(req) => {
      setSelectedTimelineRequest(null);
      setSelectedClaimSlipRequest(req);
    }}
  />
  <ClaimSlipDialog
    request={selectedClaimSlipRequest}
    open={selectedClaimSlipRequest !== null}
    onOpenChange={(open) => !open && setSelectedClaimSlipRequest(null)}
  />
  ```

**Step 3: Run tests and build**

Run: `npm run test` and `npm run build` in `frontend`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/components/requests/my/RequestActionButton.tsx frontend/src/components/requests/my/RequestTable.tsx
git commit -m "feat(timeline): wire RequestTimelineDialog and ClaimSlipDialog in RequestTable"
```

---

### Task 4: Full Verification and Cleanup

**Files:**
- Verification only

**Step 1: Run complete test suite**

Run: `npm run test` in `frontend`
Expected: All tests pass with exit code 0.

**Step 2: Run production build**

Run: `npm run build` in `frontend`
Expected: Vite build completes with exit code 0.

**Step 3: Verification commit**

```bash
git commit --allow-empty -m "chore(timeline): verify test and build integrity for timeline tracking dialog"
```
