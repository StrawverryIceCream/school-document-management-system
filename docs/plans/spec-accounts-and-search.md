# Spec: Accounts and Search

## Problem Statement

Administrators and staff members need to manage institution-wide accounts effectively, but face several operational bottlenecks:
1. Account search is restricted to basic name, email, and student ID lookups. Searching for personnel by office (e.g., "OUR", "HRMO", "Registrar") or faculty by academic department returns no results because organizational placement is not indexed in the query.
2. Account status in the directory is currently hardcoded as "Active", hiding whether an account has been deactivated or suspended, and administrators lack an immediate mechanism to suspend or restore user authentication access without destructively deleting user history.
3. Modifying user roles without proper validation or credential synchronization causes database check constraint failures or leaves orphaned incompatible records.
4. Search across operational views is fragmented, lacking consistent debounced interactions and clear status indicators across viewports.

## Solution

Deliver a robust, unified Accounts and Search experience:
1. **Unified Account Search**: Expand backend directory search to perform cross-field query evaluation across user identity (full name, email, student ID) and organizational placement (assigned office code, office name, academic department).
2. **Account Suspension Lifecycle**: Connect the user directory status badges to the real database activation state and provide an intuitive "Activate / Deactivate" toggle in the administrator action menu that immediately updates access control without destroying audit history.
3. **Safe Role Transition and Modal Editing**: Provide dedicated modal dialogs for updating account profile information and changing roles with automatic sanitization of mutually exclusive credentials (clearing obsolete student programs or unassigning offices when switching roles).
4. **Focused Scoped Search Architecture**: Maintain performant, responsive page-level search toolbars with real-time role filtering and debouncing across desktop, tablet, and mobile displays.

## User Stories

1. As an administrator, I want to search accounts by office code (e.g., "OUR", "HRMO"), so that I can quickly find all staff members assigned to a specific institutional office.
2. As an administrator, I want to search accounts by office full name (e.g., "University Registrar"), so that I can locate staff even if I do not remember the exact code abbreviation.
3. As an administrator, I want to search faculty accounts by academic department (e.g., "Computer Studies"), so that I can review teachers belonging to a specific department.
4. As an administrator, I want to search student accounts by their student ID number, so that I can pull up student records from institutional IDs.
5. As an administrator, I want account search to query across names and email addresses simultaneously, so that partial matching works regardless of the input provided.
6. As an administrator, I want the accounts directory to display the actual operational state (Active vs. Suspended) of every user, so that I know who currently has system access.
7. As an administrator, I want to deactivate a user account with a single action, so that I can immediately suspend system access for inactive or terminated personnel.
8. As an administrator, I want to reactivate a suspended account, so that reinstated personnel or students can resume accessing their portals.
9. As an administrator, I want deactivating an account to preserve all existing request histories, audit logs, and document references, so that compliance and data integrity are maintained.
10. As an administrator, I want to filter the accounts directory by user role tabs (All, Students, Teachers, Staff, Admins), so that I can isolate specific user groups.
11. As an administrator, I want to see dynamic count badges on each role tab, so that I have immediate visibility into total accounts per category.
12. As an administrator, I want the search query to remain active when switching role tabs, so that I can filter my search results within a specific role.
13. As an administrator, I want to edit an account's name, email, and role-specific fields in a clean modal dialog, so that data entry is focused and avoids table layout shifts.
14. As an administrator, I want to change a user's role using a guided modal that prompts for required target role attributes (such as assigned office for staff), so that role changes never leave invalid records.
15. As an administrator, I want a clear warning when changing roles that incompatible previous attributes will be sanitized, so that I understand the consequences of role transitions.
16. As an administrator, I want to select an assigned office from a complete, authoritative list of university offices when making someone a staff member, so that invalid office identifiers are prevented.
17. As an administrator, I want to export filtered account lists to CSV, so that I can generate external rosters and reports.
18. As a staff member, I want search input to be debounced, so that typing does not flood the server with unnecessary round-trip requests.
19. As an administrator, I want pagination controls to stay synchronized with search and role filters, so that I can smoothly browse large account datasets.
20. As an administrator, I want search to handle leading, trailing, and mixed-case whitespace gracefully, so that searches never fail on accidental typos.

## Implementation Decisions

- **Multi-Field Query Expansion**: The user directory API query handler will join the institutional offices schema and match the search term with case-insensitive pattern matching against full name, email, student ID, department, office code, and office name.
- **Account Activation Control Endpoint**: The account update endpoint (`PATCH /api/users/:id`) will explicitly support an `isActive: boolean` attribute, automatically recording an audit event for account suspension or reinstatement.
- **Role Transition Sanitization**: When a user's role transitions:
  - Transitioning to `staff`: Requires an assigned office (by ID or code), sets `officeId` and matching legacy `office` indicator, and sets student fields (`studentId`, `collegeId`, `courseId`, `section`, `yearLevel`, `studentStatus`) and teacher fields (`department`) to `null`.
  - Transitioning to `teacher`: Sets `officeId` and `office` to `null`, clears student fields, and accepts `department`.
  - Transitioning to `student`: Sets `officeId`, `office`, and `department` to `null`, and accepts academic student fields.
  - Transitioning to `admin`: Retains system privileges and sanitizes non-applicable program credentials.
- **Office Identifier Resolution**: Both database UUIDs and human-readable office codes (e.g. "OUR", "HRMO") will be accepted by user update endpoints, normalizing to the primary database office key.
- **Directory Interface Modularization**: Inline table row editing is removed in favor of dedicated `EditUserDialog` and `ChangeRoleDialog` modals. The directory table displays an "Office / Dept" column with structured badges and an active/suspended status indicator reflecting `isActive`.
- **Scoped Search Architecture**: Search remains localized to page-level toolbars rather than introducing a global omnibar, keeping bandwidth low and preserving context isolation.

## Testing Decisions

- **Testing Principles**: Tests will evaluate external HTTP and UI behaviors rather than private component states. API tests verify that query parameters return expected subsets and reject invalid transitions with proper HTTP status codes.
- **Search Query Verification**: Unit tests verify that searching office codes ("OUR"), department strings ("Mathematics"), or partial emails returns the matching user records while excluding non-matching records.
- **Role Transition Testing**: Integration checks ensure that changing roles from student to staff strips student attributes and updates office references without throwing check constraint violations.
- **Account Suspension Testing**: Tests verify that toggling `isActive` to false updates the user status, prevents authentication, and preserves existing document requests linked to that user ID.
- **Prior Art**: Builds on the test harnesses established in `backend/src/tests/user-role-transition.test.ts` and `frontend/src/lib/sectors/__tests__/request-table-route.test.ts`.

## Out of Scope

- Institution-wide global keyboard command palette (`Cmd+K` / `Ctrl+K`) spanning requests, offices, and settings simultaneously.
- Self-service account deletion or self-service role requests by non-admin users.
- Batch multi-select bulk role updates or bulk account deactivations in a single click.
- Two-factor authentication (2FA) credential administration within the account edit dialog.

## Further Notes

- Relates to GitHub issues #49 ("Add Search functionality in Frontend") and #50 ("Add column details in account pages").
- Aligns with the domain definitions in `GLOSSARY.md` for *Unified Account Search*, *Account Suspension Lifecycle*, and *Role Transition Sanitization*.
