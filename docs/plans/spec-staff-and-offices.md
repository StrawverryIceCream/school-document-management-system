# Spec: Staff Operations, Request Delegation & Scoped Workspace

Closes #42, #44, #45

## Problem Statement

As the document management system expands to handle real operations across multiple university offices and sectors, office staff face three critical operational bottlenecks:

1. **Unassigned Task Queues (#42)**: Requests arrive in global or office-wide queues without clear ownership or accountability. Staff members cannot delegate specific requests to colleagues within their office or designate who is actively processing a document, leading to duplicated effort or dropped requests.
2. **Obsolete Counter Window Telemetry (#44)**: The staff and admin dashboards still feature hardcoded legacy counter windows (fixed to 6 academic colleges: COS, COE, CAFA, CMMS, CIT, CIE), completely obscuring live queue loads across real administrative and financial offices such as the Registrar, HRMO, Cashier, Accounting, and Auxiliary Services.
3. **Unfiltered Workspace Clutter (#45)**: Staff members are exposed to all university sectors, divisions, and offices indiscriminately in the sidebar. Staff assigned to a specific office (such as HRMO in OVPAF or Registrar in OVPAA) must sift through dozens of irrelevant organizational units, increasing cognitive load and accidental access across department boundaries.

## Solution

Deliver an integrated staff operations framework that equips university personnel with clear delegation tools, real operational telemetry, and focused workspaces:

1. **Office-Scoped Staff Delegation**: Introduce an assignment API and UI allowing office staff to delegate any request to an active staff colleague belonging to the same issuing office (or self-assign). Delegating records an audit event, surfaces the assignee badge across tables, and notifies the assignee via in-app notification.
2. **Live Office Counter Loads**: Replace the hardcoded 6-college window card on the dashboard with a dynamic operational component that aggregates real in-flight requests by institutional office (e.g., OUR, HRMO, Cashier, Accounting, Colleges), displaying live queue depth and direct links into office workspaces.
3. **Role & Office-Scoped Navigation**: Upgrade sidebar and sector visibility so non-admin staff users default to a scoped workspace focused on their assigned sector and division hierarchy, while system administrators retain comprehensive visibility across all institutional units.

## User Stories

1. As an office staff member, I want to assign a pending or processing request to a specific staff colleague in my office, so that workload is evenly distributed with clear individual responsibility.
2. As an office staff member, I want to assign a request to myself with a single click, so that other staff know I am currently working on it.
3. As an office staff member, I want to see the current assignee's name on the request review card and table row, so that I immediately know who is handling each document.
4. As an office staff member, I want to receive an in-app notification when a colleague or supervisor assigns a document request to me, so that I can promptly begin processing.
5. As an office staff member, I want the assignee dropdown to only list active staff users belonging to my office, so that requests cannot be mistakenly assigned to unrelated personnel in other departments.
6. As a system administrator, I want to reassign or unassign requests across any office in the university, so that I can resolve bottlenecks during staff leaves or peak periods.
7. As an auditor, I want every delegation action to be recorded in the audit log with the actor ID, assignee ID, and timestamp, so that custody of documents is fully traceable.
8. As an office supervisor, I want to filter requests in my office by assignee, so that I can monitor individual turnaround times and pending caseloads.
9. As a dashboard viewer, I want the dashboard counter loads widget to display active request volumes for real university offices (OUR, HRMO, Cashier, Accounting, Colleges), so that institutional load is accurately portrayed.
10. As a dashboard viewer, I want to click any office card in the counter loads widget to navigate directly into that office's workspace, so that I can immediately inspect the live queue.
11. As a staff member, I want the counter widget to visually highlight heavy loads (e.g. 8+ active requests) versus normal or idle queues, so that operational congestion is instantly recognizable.
12. As a non-admin staff member, I want my sidebar navigation to default to my assigned sector and division, so that my daily workspace is clean and relevant to my responsibilities.
13. As a system administrator, I want to view and manage all sectors and divisions across the university, so that I can administer cross-sector operations and form configurations.
14. As an office staff member reassigned to a new office, I want my workspace permissions and navigation to automatically adapt to my new office assignment upon login, so that my access matches my institutional role.

## Implementation Decisions

1. **Staff Delegation API Contract**:
   - Add endpoint `PATCH /api/requests/:id/assign` (or accept `assignedToId` in `PATCH /api/requests/:id/status`) restricted to staff and admins.
   - Validation rule: If actor is staff, verify that `actor.officeId === request.documentType.officeId` and target `assignedToId` belongs to an active user with `role === "staff"` and `user.officeId === request.documentType.officeId`. Admins bypass office boundary checks.
   - Database update: Sets `documentRequests.assignedTo` to the target user ID and updates `updatedAt`.
   - Notification dispatch: Calls `createNotification` for the target assignee with type `"status_update"`, title `"Request Assigned"`, and message referencing the document name and reference number.
   - Audit trail: Calls `recordAuditLog` with action `"request_assigned"` capturing previous and new assignee IDs.

2. **Frontend Delegation UI**:
   - In `SectorRequestReview` and `RequestDetailsDialog`, display an Assignee field with an interactive popover or select dropdown listing available office colleagues fetched from `/api/offices/:id/staff` (or filtered from active staff users).
   - Display a distinct assignee badge (Avatar + Full Name) on table rows in `RequestTable` and `OfficeRequestTable`.

3. **Dashboard Office Counter Loads**:
   - Replace static `WINDOW_DEFS` in `WindowCounterLoads.tsx` with dynamic aggregation over `requests` in `DashboardContext`.
   - Group in-flight requests (`pending`, `awaiting_payment`, `processing`, `ready`) by `officeCode`.
   - Render top active offices with live count, load severity badge (Idle, Normal, Active, Heavy), and direct link to `/sectors/:sectorId/:divisionId/:officeId`.

4. **Scoped Workspace Navigation**:
   - In `SectorsVisibilityProvider.tsx`, incorporate `user.officeId`, `user.office`, and `user.role` from `useAuth()`.
   - If `user.role === "staff"` and user is assigned to an office, scope `visibleSectors` to the sector matching `user.office.sector`. Non-home sectors are filtered from the primary sidebar navigation.
   - System administrators (`user.role === "admin"`) retain full global visibility of all sectors.

## Testing Decisions

- **Test Quality Principles**: Test observable behavior across boundaries rather than private implementation details. Validate authorization guards, state transitions, notifications, and navigation scoping.
- **Backend Seam**:
  - Test `PATCH /api/requests/:id/assign`:
    - Valid assignment within office succeeds (200 OK), sets `assignedTo`, creates in-app notification, and writes audit log.
    - Assignment to a staff user from a different office fails with `403 Forbidden`.
    - Assignment by a requester/student fails with `403 Forbidden`.
- **Frontend Seam**:
  - Test `office-counter-loads.test.ts`: Validates dynamic calculation of office queue loads and severity indicators from raw request lists.
  - Test `staff-visibility-scoping.test.ts`: Validates that non-admin staff users only receive their home sector in `visibleSectors`, while admins receive all active sectors.
  - Test `e2e-staff-offices.test.ts`: End-to-end page render verifying assignee assignment flow, counter loads rendering, and sidebar scoping.

## Out of Scope

- Multi-party simultaneous co-assignment (each request has exactly one primary assignee).
- Automated round-robin auto-assignment algorithms (assignment is manual delegation by staff/supervisors).
- Complex custom RBAC permission matrices beyond the established Admin vs. Staff role hierarchy.

## Further Notes

- Leverages existing `assignedTo` foreign key already present in `backend/src/db/schema.ts` (`assigned_to_id`).
- Integrates seamlessly with the dual dispatch and notification infrastructure built in Spec #52.
- Respects the domain terminology defined in `GLOSSARY.md` (`Staff Delegation`, `Assignee`, `Office Counter Load`, `Scoped Workspace`).
