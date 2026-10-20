# Codebase File & Folder Organization Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the frontend `components/` and `lib/` directory structures into a consistent, domain-aligned layout with normalized kebab-case naming, eliminating ghost folders, loose guards, and fragmented sub-domains.

**Architecture:** Maintain the Vite/React layered architecture while establishing clean domain clusters: group all request variants under `components/requests/` and `lib/requests/`, counter windows under `components/windows/` and `lib/windows/`, normalize feature folders (`dashboard`, `logs`, `documents`, `notifications`), relocate loose guards to `components/guards/`, and standardize multi-word file naming on kebab-case.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4.

---

### Task 1: Clean Up Ghost Folders & Relocate Loose Route Guards

**Files:**
- Move: `frontend/src/components/RequireAuth.tsx` -> `frontend/src/components/guards/RequireAuth.tsx`
- Move: `frontend/src/components/RequireRole.tsx` -> `frontend/src/components/guards/RequireRole.tsx`
- Move: `frontend/src/components/ModeToggle.tsx` -> `frontend/src/components/shared/ModeToggle.tsx`
- Delete: `frontend/src/components/dashboard` (empty)
- Delete: `frontend/src/components/pay` (empty)
- Modify: `frontend/src/App.tsx` and callers of `RequireAuth`, `RequireRole`, `ModeToggle`

**Step 1: Relocate components**
Move route guards to `components/guards/` and theme toggle to `components/shared/`. Remove empty directories.

**Step 2: Update import statements**
Update `App.tsx` and layout headers:
```typescript
import RequireAuth from "@/components/guards/RequireAuth";
import RequireRole from "@/components/guards/RequireRole";
import ModeToggle from "@/components/shared/ModeToggle";
```

**Step 3: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors, build succeeds.

**Step 4: Commit**
```bash
git add frontend/src/components/ frontend/src/App.tsx
git commit -m "refactor(structure): move route guards to guards/ and clean ghost folders"
```

---

### Task 2: Normalize Feature Folders (`dashboard`, `logs`, `documents`, `notifications`)

**Files:**
- Move: `frontend/src/components/dashboard_page/` -> `frontend/src/components/dashboard/`
- Move: `frontend/src/lib/dashboard.ts` -> `frontend/src/lib/dashboard/dashboard.ts` (or re-export)
- Move: `frontend/src/components/logs_page/` -> `frontend/src/components/logs/`
- Move: `frontend/src/lib/logs.ts` -> `frontend/src/lib/logs/logs.ts`
- Move: `frontend/src/components/document_manager/` -> `frontend/src/components/documents/`
- Move: `frontend/src/lib/document.ts` -> `frontend/src/lib/documents/documents.ts`
- Move: `frontend/src/components/notification/` -> `frontend/src/components/notifications/`
- Modify: `pages/Dashboard.tsx`, `pages/Logs.tsx`, `pages/DocumentManager.tsx`, `pages/Notifications.tsx`, and connected hooks/components

**Step 1: Move component folders**
Rename `dashboard_page` -> `dashboard`, `logs_page` -> `logs`, `document_manager` -> `documents`, `notification` -> `notifications`.

**Step 2: Align matching lib files**
Group dashboard, logs, and document helpers into domain folders with standardized naming.

**Step 3: Update imports**
Update `Dashboard.tsx`, `Logs.tsx`, `DocumentManager.tsx`, and `Notifications.tsx` import paths.

**Step 4: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors, build succeeds.

**Step 5: Commit**
```bash
git add frontend/src/components/ frontend/src/lib/ frontend/src/pages/
git commit -m "refactor(structure): normalize feature component and lib folders"
```

---

### Task 3: Consolidate Counter Windows Domain (`components/windows` & `lib/windows`)

**Files:**
- Move: `frontend/src/components/window/` -> `frontend/src/components/windows/`
- Move: `frontend/src/components/window_request_review/` -> `frontend/src/components/windows/review/`
- Move: `frontend/src/lib/windowRequests.ts` -> `frontend/src/lib/windows/windows.ts`
- Move: `frontend/src/lib/college-window-cards.ts` -> `frontend/src/lib/windows/cards.ts`
- Move: `frontend/src/lib/windows-header.ts` -> `frontend/src/lib/windows/header.ts`
- Move: `frontend/src/lib/window_request_review/` -> `frontend/src/lib/windows/review/`
- Modify: `pages/Windows.tsx`, `pages/WindowRequestReview.tsx`, `hooks/useWindowView.ts`, and callers

**Step 1: Consolidate components into `components/windows/`**
Place counter window cards, list tiles, and review components into a single coherent domain hierarchy.

**Step 2: Consolidate lib helpers into `lib/windows/`**
Eliminate snake_case and kebab-case sprawl in `src/lib/` for window routing and reviews.

**Step 3: Update imports across callers**
Update pages, hooks, and review dialogs to reference `@/components/windows/...` and `@/lib/windows/...`.

**Step 4: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors, build succeeds.

**Step 5: Commit**
```bash
git add frontend/src/components/windows/ frontend/src/lib/windows/ frontend/src/pages/ frontend/src/hooks/
git commit -m "refactor(structure): consolidate counter windows components and lib logic"
```

---

### Task 4: Consolidate Document Requests Domain (`components/requests` & `lib/requests`)

**Files:**
- Move: `frontend/src/components/all_requests/` -> `frontend/src/components/requests/all/`
- Move: `frontend/src/components/my_request/` -> `frontend/src/components/requests/my/`
- Move: `frontend/src/components/new_request/` -> `frontend/src/components/requests/new/`
- Move: `frontend/src/components/payments/` -> `frontend/src/components/requests/payments/`
- Move: `frontend/src/lib/request.ts` -> `frontend/src/lib/requests/requests.ts`
- Move: `frontend/src/lib/myRequest.ts` -> `frontend/src/lib/requests/my-requests.ts`
- Move: `frontend/src/lib/payment-proof.ts` -> `frontend/src/lib/requests/payments.ts`
- Modify: `pages/AllRequest.tsx`, `pages/MyRequest.tsx`, `pages/NewRequest.tsx`, `pages/Home.tsx`, `context/RequestContext.tsx`, and callers

**Step 1: Consolidate request component variants**
Group all, my, new, and payments under `components/requests/`.

**Step 2: Consolidate request lib helpers**
Replace camelCase `myRequest.ts` with kebab-case `my-requests.ts` under `lib/requests/`.

**Step 3: Update imports across callers**
Update pages (`AllRequest.tsx`, `MyRequest.tsx`, `NewRequest.tsx`, `Home.tsx`) and contexts.

**Step 4: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors, build succeeds.

**Step 5: Commit**
```bash
git add frontend/src/components/requests/ frontend/src/lib/requests/ frontend/src/pages/ frontend/src/hooks/ frontend/src/context/
git commit -m "refactor(structure): consolidate document requests components and lib logic"
```

---

### Task 5: Consolidate Profile Helpers & Full End-to-End Build Verification

**Files:**
- Move: `frontend/src/lib/profile.ts` -> `frontend/src/lib/profile/profile.ts`
- Move: `frontend/src/lib/profile-fields.ts` -> `frontend/src/lib/profile/fields.ts`
- Modify: `components/profile/ProfileTrigger.tsx` and callers of profile helpers

**Step 1: Consolidate profile lib helpers**
Move profile files into `lib/profile/` and update callers.

**Step 2: Full End-to-End Build Verification**
Run:
- `npm run build` in `frontend/`
- `npm run build` in `backend/`
Ensure 0 TypeScript errors and clean compilation across both workspaces.

**Step 3: Commit**
```bash
git add frontend/src/lib/profile/ frontend/src/components/profile/
git commit -m "refactor(structure): finalize profile lib organization and verify full build"
```
