# Spec: Request Lifecycle & Student View Overhaul

Addresses #40, #43, and #48.

## Problem Statement

Students and staff experience friction and confusion during document filing and tracking:
1. Requesters are shown all active documents indiscriminately, even those they are not entitled to request (e.g. alumni transcripts shown to active undergraduates, graduation clearance shown to freshmen), leading to rejected filings and wasted processing fees.
2. The student's "My Request" dashboard cards display placeholder, hardcoded text (e.g. "College of Science" window, dummy "Express Priority", truncated internal database IDs) instead of actual reference numbers, designated offices, payment states, and pickup dates.
3. Staff and administrators viewing the global requests list must navigate generic dropdown selectors to filter by office, slowing down daily review when focusing on their assigned office or common departments.

## Solution

A cohesive student experience and staff workflow enhancement:
1. **Per-Student Status Document Eligibility**: Filter document catalog cards in the request creation wizard based on the authenticated user's role and specific student status (`regular`, `irregular`, `graduating`, `alumni`), ensuring users only see and file requests for documents they are eligible to receive.
2. **Dynamic Request Card Overhaul**: Replace all placeholder and dummy copy in personal request cards with live request metadata: official reference number, assigned office name, payment status badges (`Awaiting Payment`, `Verified`), release date schedules, and real purpose statements.
3. **Office Shortcut Pills in All Requests**: Add one-click office filter chips above the global request queue (including "All", "My Office", and available office destinations) enabling staff to instantly filter their workload.

## User Stories

1. As a regular undergraduate student, I want to see only documents available to regular students in the document catalog, so that I do not submit invalid filings.
2. As a graduating senior, I want to see graduation clearance and certificate options in my catalog, so that I can initiate my commencement requirements.
3. As an alumnus, I want to see records specifically designated for alumni (e.g. official transcript of records for alumni) and not active-student certificates.
4. As a teacher, I want to see only faculty and employee records in my document catalog, so that student documents do not clutter my filing view.
5. As a student requester, I want to see my official reference number (e.g. REQ-2026-0042) clearly on each request card, so that I can present it at campus service windows.
6. As a student requester, I want to see the exact campus office assigned to process my request, so that I know where my physical documents reside without guessing.
7. As a student requester, I want to see whether my payment is pending or verified directly on the card, so that I know if further cashier action is required.
8. As a student requester, I want to see my scheduled pickup date and time once my document is marked ready, so that I can claim it before storage expiration.
9. As a student requester, I want all dummy badges like "Express Priority" removed, so that only authentic processing statuses are displayed.
10. As an office staff member, I want a "My Office" shortcut pill in the all requests queue, so that I can scope the entire view to my department in one click.
11. As an administrator, I want to quickly toggle between different office shortcut pills (e.g. Registrar, HRMO, Accounting), so that I can audit queues across sectors rapidly.
12. As a staff member, I want the active office shortcut pill to visually indicate selection and reflect the filtered count accurately.

## Implementation Decisions

- **Eligibility Filtering Engine**: Create a client-side eligibility checker that inspects user profile attributes against document type configuration. If `allowedCategories` is defined, user role must be present. If `allowedStudentStatuses` is defined and user is a student, user `studentStatus` must be present in the array. Documents with empty/unspecified criteria remain open to all users of that category.
- **Request Card Presentation**: Update personal request card presentation components to bind to canonical fields: `referenceNumber`, `officeName` (resolved from office relation or office code mapping), `amountDue`, `paymentStatus` (derived from payment association), and `releaseDate`. Strip all static strings and dummy badges.
- **Office Shortcut Bar**: Implement a persistent pill navigation bar above the requests data table. Fetch available offices dynamically and compute the user's home office from their profile. Selecting a pill updates the table query state immediately.

## Testing Decisions

- **Testing Principle**: Tests will verify end-to-end page render behavior, asserting that the rendered DOM displays the expected filtered documents for specific user profiles, renders accurate dynamic request card content without placeholder text, and renders responsive office shortcut pills that update the filtered request list.
- **Modules Tested**:
  - Request creation page and document catalog grid render.
  - Personal request list card render.
  - Global request queue and office shortcut bar render.
- **Prior Art**: Follow the component and page test conventions established in the frontend repository using testing utilities and end-to-end render assertions.

## Out of Scope

- Administrative authoring UI for creating new document types (covered by Document Manager).
- Online payment gateway redirect integrations.
- Physical counter queue ticket printer hardware integrations.

## Further Notes

- Directly implements GitHub issues #40, #43, and #48.
- Triage label `ready-for-agent` applied on publication.
