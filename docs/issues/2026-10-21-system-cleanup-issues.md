# System Cleanup & Technical Debt Issues

This document tracks actionable issues identified in the October 21, 2026 audit for the School Document Management System.

---

## Issue 1: [BUG] Fix unhandled runtime crash on legacy `/windows/.../requests/:requestId` route

- **Priority**: Must Fix (Critical)
- **Labels**: `bug`, `frontend`, `routing`
- **Location**: [WindowRequestReview.tsx:L31](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/pages/WindowRequestReview.tsx#L31), [App.tsx:L118-120](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/App.tsx#L118-L120)

### Problem
`WindowRequestReview.tsx` invokes `useWindowView()`, but [App.tsx](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/App.tsx) mounts `/windows/:collegeId/requests/:requestId` outside of `WindowViewProvider`. Navigating to this URL throws an uncaught error (`"useWindowView must be used within WindowViewProvider"`), crashing the entire frontend React tree.

### Proposed Fix
1. In [App.tsx](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/App.tsx), replace the route with a redirect to the unified sector workspace:
   ```tsx
   <Route
     path="/windows/:collegeId/requests/:requestId"
     element={<Navigate to="/sectors/ovpaa/colleges" replace />}
   />
   ```
2. Delete unused [WindowRequestReview.tsx](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/pages/WindowRequestReview.tsx) and clean up dead imports.

### Acceptance Criteria
- Accessing `/windows/anything/requests/anything` does not white-screen or throw runtime errors.

---

## Issue 2: [SECURITY] Restrict routing step approvals to assigned office staff and admins

- **Priority**: Must Fix (Security)
- **Labels**: `security`, `backend`, `rbac`
- **Location**: [routingSteps.controller.ts:L41-83](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/controllers/routingSteps.controller.ts#L41-L83), [requests.routes.ts:L33-38](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/routes/requests.routes.ts#L33-L38)

### Problem
`PATCH /api/requests/:id/steps/:stepId` verifies that the caller has a `staff` or `admin` role, but does not verify that a `staff` member belongs to `currentStep.officeId`. Any staff member across the university (e.g., Registrar Window 1) can sign off, approve, or reject routing steps intended for Cashier, Dean, or HRMO.

### Proposed Fix
1. In `updateRoutingStepStatus`, retrieve the caller's office affiliation:
   ```typescript
   const caller = await db.query.users.findFirst({
     where: eq(users.id, req.session.userId),
     columns: { role: true, officeId: true },
   });
   if (caller?.role !== "admin" && caller?.officeId !== currentStep.officeId) {
     return res.status(403).json({ error: "Unauthorized to act on this routing step" });
   }
   ```

### Acceptance Criteria
- Non-admin staff attempting to update routing steps of another office receive `403 Forbidden`.
- Office staff can update steps matching their assigned `officeId`.
- Admins can update any step.

---

## Issue 3: [STABILITY] Persist user sessions in PostgreSQL instead of memory store

- **Priority**: Must Fix (Reliability)
- **Labels**: `backend`, `stability`, `auth`
- **Location**: [server.ts:L29-41](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/server.ts#L29-L41)

### Problem
`express-session` uses default `MemoryStore`. It logs a production warning, leaks memory over time, and immediately invalidates all active user sessions whenever the server process restarts or deploys.

### Proposed Fix
1. Install `connect-pg-simple` and `@types/connect-pg-simple`.
2. Configure session store to use the existing Neon connection pool:
   ```typescript
   import connectPgSimple from "connect-pg-simple";
   const PgSession = connectPgSimple(session);
   app.use(
     session({
       store: new PgSession({ pool, createTableIfMissing: true }),
       secret: process.env.SESSION_SECRET!,
       resave: false,
       saveUninitialized: false,
       // cookie settings...
     }),
   );
   ```

### Acceptance Criteria
- Server restart retains authenticated user sessions.
- MemoryStore leak warning is gone.

---

## Issue 4: [SECURITY] Enforce authentication and staff role on sector metrics endpoint

- **Priority**: Must Fix (Security)
- **Labels**: `security`, `backend`, `api`
- **Location**: [offices.routes.ts:L10-12](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/routes/offices.routes.ts#L10-L12)

### Problem
`GET /api/offices/sectors/:sectorId/metrics` has no auth guard. Unauthenticated clients can inspect live document request volumes, processing backlogs, and claim rates across university sectors.

### Proposed Fix
Add `requireAuth` and `requireRoles("admin", "staff")` to the route:
```typescript
router.get(
  "/sectors/:sectorId/metrics",
  requireAuth,
  requireRoles("admin", "staff"),
  getSectorMetrics,
);
```

### Acceptance Criteria
- Unauthenticated requests receive `401 Unauthorized`.
- Students receive `403 Forbidden`.
- Staff and admin receive metrics.

---

## Issue 5: [PERF] Eliminate N+1 queries in `getSectorMetrics` controller

- **Priority**: Should Fix (Performance)
- **Labels**: `performance`, `backend`, `database`
- **Location**: [offices.controller.ts:L127-145](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/controllers/offices.controller.ts#L127-L145)

### Problem
`getSectorMetrics` maps over `sectorOffices` with `Promise.all` and issues a separate SQL query with joins and grouping per office. For sectors with 15 offices (e.g., OVPAA), 15 parallel queries hit Neon serverless PostgreSQL per page visit, creating high connection contention.

### Proposed Fix
Replace the loop with a single grouped query over the sector's offices:
```typescript
const counts = await db
  .select({
    officeId: documentTypes.officeId,
    status: documentRequests.status,
    count: count(),
  })
  .from(documentRequests)
  .innerJoin(documentTypes, eq(documentRequests.documentTypeId, documentTypes.id))
  .innerJoin(offices, eq(documentTypes.officeId, offices.id))
  .where(and(eq(offices.sector, normalizedSector), eq(offices.isActive, true)))
  .groupBy(documentTypes.officeId, documentRequests.status);
```

### Acceptance Criteria
- Single SQL roundtrip generates metrics for all offices in a sector.
- Endpoint latency reduced under load.

---

## Issue 6: [BUG] Pass sector and office query filters from SectorPage to requests API

- **Priority**: Should Fix (Bug)
- **Labels**: `bug`, `frontend`, `api`
- **Location**: [SectorPage.tsx:L22](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/pages/SectorPage.tsx#L22), [requests.ts:L77-95](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/api/requests.ts#L77-L95)

### Problem
`SectorPage.tsx` calls `getAllRequests({ limit: 100 })` globally without passing `sector` or `officeCode`, then filters results client-side in `OfficeRequestTable.tsx`. When system-wide requests exceed 100, constituent offices show incomplete or empty queues because their requests fall outside the first 100 records.

### Proposed Fix
1. Extend `GetAllRequestsParams` in [requests.ts](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/api/requests.ts) with `officeId?: string; officeCode?: string; sector?: string;`.
2. In [SectorPage.tsx](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/pages/SectorPage.tsx), pass `sector: sector.code` and `officeCode: office?.code`.

### Acceptance Criteria
- Request table fetches only requests relevant to the selected sector or office directly from the backend.
- Pagination reflects the office's actual count rather than client-sliced data.

---

## Issue 7: [CLEANUP] Remove dead legacy administration and HR components and routes

- **Priority**: Should Fix (Cleanup)
- **Labels**: `cleanup`, `frontend`, `yagni`
- **Location**: [Administration.tsx](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/pages/Administration.tsx), [HumanResource.tsx](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/pages/HumanResource.tsx), `frontend/src/components/administration/*`, `frontend/src/provider/AdministrationViewProvider.tsx`, `frontend/src/context/AdministrationViewContext.tsx`

### Problem
Following the sector-based navigation refactor, `/administration` and `/human-resource` redirect to the respective sector routes. The entire `components/administration/` hierarchy (5 components), context, provider, and hook are dead code totaling ~450 lines.

### Proposed Fix
1. Delete `Administration.tsx` and `HumanResource.tsx`.
2. Delete `frontend/src/components/administration/`.
3. Delete `AdministrationViewProvider.tsx`, `AdministrationViewContext.tsx`, and `useAdministrationView.ts`.

### Acceptance Criteria
- Clean removal of 450+ unused lines without build or test breakage.

---

## Issue 8: [FEATURE] Populate `request_status_history` on document status transitions

- **Priority**: Should Fix (Data Integrity)
- **Labels**: `backend`, `audit`, `data-integrity`
- **Location**: [requests.controller.ts:L525-556](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/controllers/requests.controller.ts#L525-L556)

### Problem
`request_status_history` table exists in Drizzle schema with full relation definitions, but `updateRequestStatus` only updates `documentRequests` and inserts into `notifications`. The status history table remains completely empty, preventing accurate timeline display and dispute resolution.

### Proposed Fix
Inside `db.transaction(...)` in `updateRequestStatus`:
```typescript
await tx.insert(requestStatusHistory).values({
  requestId: id,
  changedBy: staffId,
  fromStatus: request.status,
  toStatus: status,
  remarks: staffNotes?.trim() || null,
});
```

### Acceptance Criteria
- Every status transition creates an immutable row in `request_status_history`.

---

## Issue 9: [PERF] Cache user role and officeId in session to avoid per-request DB queries

- **Priority**: Should Fix (Performance)
- **Labels**: `performance`, `backend`, `auth`
- **Location**: [requireRoles.ts:L17-25](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/middleware/requireRoles.ts#L17-L25), [auth.controller.ts:L428](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/controllers/auth.controller.ts#L428), [session.d.ts](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/backend/src/session.d.ts)

### Problem
`requireRoles` queries `users` table on every single request because `req.session` only stores `userId`. This causes unnecessary DB roundtrips for every API interaction.

### Proposed Fix
1. Update `session.d.ts`:
   ```typescript
   interface SessionData {
     userId: string;
     role: string;
     officeId: string | null;
   }
   ```
2. Populate `req.session.role` and `req.session.officeId` on login and signup.
3. In `requireRoles`, check `req.session.role` directly.

### Acceptance Criteria
- `requireRoles` executes synchronously without a database query when session is cached.

---

## Issue 10: [CLEANUP] Remove redundant `cn` package and move `shadcn` CLI to devDependencies

- **Priority**: Nice to Have (Cleanup)
- **Labels**: `cleanup`, `frontend`, `dependencies`
- **Location**: [package.json:L17, 25](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/package.json#L17-L25), [utils.ts:L1-2](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/lib/utils.ts#L1-L2)

### Problem
- An external `"cn": "^0.2.6"` dependency is installed and re-exported in `utils.ts`, even though `clsx` and `tailwind-merge` are already installed.
- `"shadcn": "^4.21.0"` CLI is placed in runtime `dependencies` instead of `devDependencies`.

### Proposed Fix
1. In [utils.ts](file:///c:/Users/Admin/Desktop/3rd%20Year%20College/CSE1/school-document-management-system/frontend/src/lib/utils.ts):
   ```typescript
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```
2. Uninstall `cn` package, move `shadcn` to `devDependencies`.

### Acceptance Criteria
- `cn` helper functions identically without the external `cn` package.
- Runtime dependency count reduced by 2.
