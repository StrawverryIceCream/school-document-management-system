# Spec: Assigned Requests Workspace

## Problem Statement

Office staff and administrators need to efficiently process, monitor, and resolve document requests delegated to them. Currently, they face several operational friction points:
1. Staff members lack a dedicated view for their personal workload. In the global "All Requests" view, requests assigned to a staff member are mingled with thousands of university-wide requests, forcing personnel to manually scan or repeatedly search for their own items.
2. Staff cannot easily prioritize urgent items. There is no clear operational triage surface showing which assigned requests have pending clearance actions, which are nearing their SLA deadlines, and which are ready for window release.
3. Review navigation requires multiple clicks: finding an assigned request in a general table does not provide a direct one-click route into the office review workspace where form data inspection, PDF generation, and clearance step approvals occur.
4. Administrators lack a centralized vantage point to audit individual staff member queues, assess office workload balance, or reassign requests when staff members are absent or overloaded.

## Solution

Deliver a dedicated **Assigned Requests Workspace** accessible to staff and administrators:
1. **Dedicated Top-Level Route & Navigation**: Add an "Assigned Request" navigation item in the primary sidebar (`/assigned-request`), visible to `staff` and `admin` roles, providing an immediate home for personal and delegated queues.
2. **Assignee-Scoped Query Engine**: Enhance the document request API to support `assignedTo=me` (resolved server-side from session) and `assignedTo=<uuid>` (for administrators), returning requests with populated assignee metadata.
3. **Workload Triage & Organization**: Provide triage tabs (All Assigned, Action Needed, In Production, SLA At-Risk, Ready for Pickup) with dynamic count badges, search filtering, and sorting by SLA deadline.
4. **Seamless Review Workflow**: Provide a direct "Review" action button on every assigned row that routes immediately to `/sectors/:sectorId/:divisionId/:officeId/requests/:requestId` in the office workspace.
5. **Delegation Controls**: Support single-click "Unassign" (to release operational custody back to the office queue) and allow admins to reassign requests across active staff members.

## User Stories

1. As an office staff member, I want an "Assigned Request" item in the sidebar, so that I can access my active workload in a single click.
2. As an office staff member, I want to see all document requests currently assigned to me by default, so that I don't have to filter through unrelated institutional requests.
3. As an office staff member, I want to see a badge counter showing how many active requests are currently assigned to me, so that I immediately know my pending workload volume.
4. As an office staff member, I want to filter my assigned requests by triage tabs ("All", "Action Needed", "In Production", "SLA At-Risk", "Ready for Pickup"), so that I can organize my daily tasks.
5. As an office staff member, I want to see SLA countdown tags (e.g. "Overdue", "2 hours left", "Normal") on my assigned requests, so that I never miss compliance turnaround targets.
6. As an office staff member, I want to sort my assigned requests by SLA deadline or submission date, so that the most urgent requests appear at the top.
7. As an office staff member, I want a search bar within my assigned requests to filter by requester name, reference number, or document type, so that I can locate specific student inquiries instantly.
8. As an office staff member, I want a "Review" button on each row that navigates directly to the office review workspace for that request, so that I can immediately approve routing steps, verify attachments, or issue releases.
9. As an office staff member, I want to release an assigned request back to the office pool ("Unassign") if I am unable to fulfill it, so that other office colleagues can take custody.
10. As an office staff member, I want to view unassigned requests in my office and claim them, so that I can pull new work when my queue is clear.
11. As an administrator, I want to view requests assigned to myself by default on the Assigned Request page, so that I can manage my own administrative assignments.
12. As an administrator, I want an assignee selector dropdown on the Assigned Request page to view any specific staff member's queue, so that I can review their workload and progress.
13. As an administrator, I want to reassign any request to another staff member directly from the assigned workspace, so that I can balance office capacity during peak periods.
14. As an administrator, I want the assigned requests table to show requester details (full name, student/employee ID, department/college), so that I have complete context on each record.
15. As an office staff member, I want my active tab and search query to persist across table interactions without resetting pagination unexpectedly.
16. As an office staff member, I want real-time notification indicators when a new request is assigned to me, so that I can take custody promptly.
17. As an administrator, I want to export the filtered assigned request queue to CSV, so that I can generate workload reports for administrative meetings.
18. As an office staff member, I want an empty state with clear messaging when I have zero assigned requests, reassuring me that my queue is up to date.
19. As a student or teacher, I should not see the "Assigned Request" navigation item or be able to access `/assigned-request`, so that staff operational queues remain secure.
20. As an office staff member, I want actions taken in the review screen (marking ready, approving routing step) to update the triage counters on the assigned page automatically upon return.

## Implementation Decisions

- **Dedicated Sidebar Route**: Create `/assigned-request` route backed by an `AssignedRequests` page component. In `AppSidebar.tsx`, add `Assigned Request` to `navItems` with `roles: ["admin", "staff"]` using an appropriate Lucide icon (`ClipboardList` or `UserCheck`).
- **Backend Query Scoping**:
  - Update `GET /api/requests` in `requests.controller.ts` to accept `assignedTo` query parameter.
  - When `assignedTo=me`, the controller resolves `assignedTo` to `req.session.userId`.
  - When `assignedTo=<uuid>`, only admins or staff within the same office can query that specific assignee.
  - If `assignedTo=unassigned`, returns requests with `assignedTo IS NULL` scoped to the user's office.
- **Joined Assignee Metadata**: Ensure `getAllRequests` joins or includes the assignee user profile (`id`, `fullName`, `email`, `role`, `officeId`) so UI components can display assignee badges without secondary lookups.
- **Triage Tab Architecture**: Reuse and extend the priority triage categorization pattern (`all`, `action_needed`, `in_production`, `sla_risk`, `ready`) to compute accurate status counts client-side or via query summary.
- **Direct Workspace Navigation**: When clicking "Review" on an assigned request, resolve the target office workspace route using `findOfficeRoute({ officeCode, officeId, sector, documentTypeCode, college })` and navigate to `${route.url}/requests/${req.id}`.
- **Delegation API Integration**: Utilize existing `POST /api/requests/:id/assign` endpoint for claiming (`{ assignedTo: currentUserId }`), reassigning (`{ assignedTo: targetStaffId }`), and unassigning (`{ assignedTo: null }`).

## Testing Decisions

- **Testing Principles**: Evaluate external HTTP contracts and UI routing behaviors rather than internal implementation details. Tests verify that request filtering accurately isolates assigned queues and prevents cross-role data leaks.
- **Backend Seam Verification**: Unit tests verify that `assignedTo` query filtering returns only records assigned to the specified user ID, properly resolves `assignedTo=me`, and rejects unauthorized cross-office inspection.
- **Frontend Seam Verification**: Unit tests verify triage tab classification logic, SLA urgency determination (due date vs current time), and direct review URL generation.
- **Prior Art**: Builds on the test harnesses established in `backend/src/tests/staff-assignment.test.ts`, `backend/src/tests/accounts-search.test.ts`, and `frontend/src/lib/sectors/__tests__/request-table-route.test.ts`.

## Out of Scope

- Automated AI-based workload distribution or round-robin auto-assignment algorithms.
- Drag-and-drop Kanban board view for dragging requests across status columns.
- Live chat / messaging between requester and assignee within the assigned requests view.
- Sub-task checklists or personal calendar integration inside the request card.

## Further Notes

- Relates to user request for staff and admin "Assigned Request" tab for reviewing and organizing assigned work.
- Aligns with domain definitions in `GLOSSARY.md` for *Staff Delegation*, *Assignee*, *Assigned Requests Workspace*, and *Workload Triage*.
