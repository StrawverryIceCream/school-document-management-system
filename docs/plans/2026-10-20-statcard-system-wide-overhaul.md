# StatCard System-Wide Style & Typography Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade `StatCard` to feature larger, high-impact numbers (`text-3xl sm:text-4xl font-extrabold`) and the modern dashboard aesthetic (top accent bars, rounded-xl borders, subtle hover elevations) and roll it out consistently across all overview pages in the system.

**Architecture:** Refactor `frontend/src/components/shared/StatCard.tsx` so the dashboard's executive card aesthetic becomes the universal baseline with auto-derived top accent bars from `tone` and responsive typography that enlarges numerical metrics while gracefully handling text/date values. Roll out enhanced props and descriptive captions across all seven existing summary widgets (`WindowRequestSummary`, `MyRequestCards`, `LogsOverview`, `DocumentCards`, `RequestSummary`, `AdministrationRequestSummary`, `AccountsOverview`).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Vite.

---

### Task 1: Upgrade `StatCard` Typography and Universal Dashboard Aesthetic

**Files:**
- Modify: `frontend/src/components/shared/StatCard.tsx`
- Modify: `frontend/src/lib/tones.ts`

**Step 1: Inspect current StatCard implementation**
Verify existing props (`compact`, `topBarColor`, `tone`, `tag`, `valueClassName`, `caption`, `subtext`).

**Step 2: Add `TONE_TOP_BARS` to `tones.ts`**
Add an explicit mapping from `Tone` to Tailwind top bar accent colors:
```typescript
export const TONE_TOP_BARS: Record<Tone, string> = {
  neutral: "bg-muted-foreground/40",
  brand: "bg-primary",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  orange: "bg-orange-500",
  red: "bg-destructive",
};
```

**Step 3: Refactor `StatCard.tsx`**
1. Unify the card container styling for both standard and compact modes to use the dashboard look:
   - `group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`
   - Compact mode uses `p-4` with tight spacing for 6-column grids.
2. Auto-derive top accent bar:
   - Use `topBarColor ?? TONE_TOP_BARS[tone]` so every card receives an executive accent bar automatically.
3. Make the metric number bigger:
   - Numbers: `text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground` (up from `text-2xl font-bold`).
   - Long strings (timestamps, long text): `text-xl sm:text-2xl font-bold tracking-tight text-foreground`.
   - Update `Skeleton` height to `h-9 w-20`.
4. Header layout:
   - Label: `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground`
   - Icon container: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg` with `TONES[tone].icon` and `h-4 w-4` icon.

**Step 4: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors, build succeeds.

**Step 5: Commit**
```bash
git add frontend/src/lib/tones.ts frontend/src/components/shared/StatCard.tsx
git commit -m "feat(shared): upgrade StatCard with larger typography and universal dashboard styling"
```

---

### Task 2: Roll Out to Window Overview (`WindowRequestSummary.tsx`)

**Files:**
- Modify: `frontend/src/components/window/WindowRequestSummary.tsx`

**Step 1: Review current summary cards**
Current 4 cards: "Total Requests", "Pending Review", "Ready for Release", "Avg Turnaround".

**Step 2: Refine card definitions**
Add explicit top bar colors matching the operational tones:
- Total Requests: `brand` / `bg-primary`
- Pending Review: `amber` / `bg-amber-500`
- Ready for Release: `emerald` / `bg-emerald-500`
- Avg Turnaround: `sky` / `bg-sky-500`

**Step 3: Verify build**
Run: `npm run build` in `frontend/`
Expected: Build passes with 0 errors.

**Step 4: Commit**
```bash
git add frontend/src/components/window/WindowRequestSummary.tsx
git commit -m "style(windows): update WindowRequestSummary with dashboard card aesthetics"
```

---

### Task 3: Roll Out to My Requests Overview (`MyRequestCards.tsx`)

**Files:**
- Modify: `frontend/src/components/my_request/MyRequestCards.tsx`

**Step 1: Review current summary cards**
Current 3 cards: "Total Requests", "Active Requests", "Ready for Release".

**Step 2: Add descriptive captions and explicit tones**
- "Total Requests": `tone: "brand"`, caption: "Total submitted document filings"
- "Active Requests": `tone: "amber"`, caption: "In review or processing pipeline"
- "Ready for Release": `tone: "emerald"`, caption: "Available for registrar counter pickup"

**Step 3: Verify build**
Run: `npm run build` in `frontend/`
Expected: Build passes with 0 errors.

**Step 4: Commit**
```bash
git add frontend/src/components/my_request/MyRequestCards.tsx
git commit -m "style(my-requests): update MyRequestCards with descriptive captions and dashboard styling"
```

---

### Task 4: Roll Out to Document Manager & System Logs (`DocumentCards.tsx` & `LogsOverview.tsx`)

**Files:**
- Modify: `frontend/src/components/document_manager/DocumentCards.tsx`
- Modify: `frontend/src/components/logs_page/LogsOverview.tsx`

**Step 1: Refactor `DocumentCards.tsx`**
Add captions to document metrics:
- "Total Documents": caption "Configured institutional document types", `tone: "brand"`
- "Active Documents": caption "Available for student online requests", `tone: "emerald"`
- "Inactive Documents": caption "Archived or temporarily suspended", `tone: "rose"`

**Step 2: Refactor `LogsOverview.tsx`**
Ensure "Last Activity" timestamp scales gracefully with the new typography, and add captions:
- "Total Logs": caption "Recorded system audit events", `tone: "brand"`
- "Active Accounts": caption "Users with logged system activity", `tone: "emerald"`
- "Last Activity": caption "Most recent recorded operation", `tone: "sky"`

**Step 3: Verify build**
Run: `npm run build` in `frontend/`
Expected: Build passes with 0 errors.

**Step 4: Commit**
```bash
git add frontend/src/components/document_manager/DocumentCards.tsx frontend/src/components/logs_page/LogsOverview.tsx
git commit -m "style(catalog, logs): apply enhanced StatCard styling to DocumentCards and LogsOverview"
```

---

### Task 5: Roll Out to All Requests & Administration (`RequestSummary.tsx` & `AdministrationRequestSummary.tsx`)

**Files:**
- Modify: `frontend/src/components/all_requests/RequestSummary.tsx`
- Modify: `frontend/src/components/administration/AdministrationRequestSummary.tsx`

**Step 1: Refactor `RequestSummary.tsx`**
Add captions and status badges:
- "Total Requests": `tone: "neutral"`, caption "Across all colleges and academic departments"
- "Pending": `tone: "amber"`, caption "Awaiting evaluation and payment confirmation"
- "Processing": `tone: "brand"`, caption "In queue for verification and printing"
- "Ready": `tone: "emerald"`, caption "Completed and staged for counter release"

**Step 2: Refactor `AdministrationRequestSummary.tsx`**
Align office summary cards with unit tags and captions:
- "Office Requests": caption: `${activeUnit.code} active queue submissions`
- "Pending Review": caption: "Awaiting office endorsement"
- "Ready for Release": caption: "Cleared for release"

**Step 3: Verify build**
Run: `npm run build` in `frontend/`
Expected: Build passes with 0 errors.

**Step 4: Commit**
```bash
git add frontend/src/components/all_requests/RequestSummary.tsx frontend/src/components/administration/AdministrationRequestSummary.tsx
git commit -m "style(requests, admin): apply dashboard StatCard aesthetic to RequestSummary and AdministrationRequestSummary"
```

---

### Task 6: Roll Out to Accounts Overview & Full End-to-End Verification (`AccountsOverview.tsx`)

**Files:**
- Modify: `frontend/src/components/accounts/AccountsOverview.tsx`
- Modify: `frontend/src/lib/accounts/accounts-overview.ts`

**Step 1: Update AccountsOverview config**
Ensure 5 user account metrics (Total, Students, Faculty, Staff, Admins) have proper topBarColors and clean tag formatting.

**Step 2: Full End-to-End Build and Verification**
Run:
- `cd frontend; npm run build`
- `cd ../backend; npm run build`
Ensure 0 errors across the full stack.

**Step 3: Commit**
```bash
git add frontend/src/components/accounts/AccountsOverview.tsx frontend/src/lib/accounts/accounts-overview.ts
git commit -m "style(accounts): apply dashboard StatCard aesthetic to AccountsOverview"
```
