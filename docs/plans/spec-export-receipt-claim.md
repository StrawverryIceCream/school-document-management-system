# Spec: Universal CSV Export, Payment Receipts, and Counter Claim Hand-Off

## Problem Statement

Administrators, office counter staff, and students face critical workflow gaps during audit reporting, payment completion, and final document release:

1. **Inability to Export Operational Data**: Administrators and office heads cannot export table data from Accounts, Document Types, Office Queues, or All Requests. Compiling accreditation reports, CHED compliance data, and university registrar audits currently requires manual copy-pasting or direct database queries.
2. **Missing Payment Proof Documentation (Receipts)**: While the platform supports submitting payment proof and administrative verification, requesters receive no formal institutional documentation once payment is verified. There is no printable or digital Official Receipt (OR) slip summarizing transaction reference numbers, assessment breakdowns, and verifying cashier audit stamps.
3. **Unverified Counter Handoff During Claiming**: When physical documents are ready for pickup, moving a request to "Claimed" currently lacks verification enforcement. Staff are not prompted to record claimant identity (whether the student themselves or an authorized proxy presenting an authorization letter and ID), resulting in weak custody audit trails for sensitive scholastic credentials.

## Solution

Deliver a cohesive operational closure package:
1. **Universal Client-Side CSV Export**: Equip all core administrative tables (Accounts, Documents Management, Office Request Queues, Assigned Requests, All Requests) with an instant CSV export capability that serializes currently filtered, searched, and active table rows with ISO timestamped filenames and RFC 4180 compliance.
2. **Digital Official Receipt (OR) Slip**: Provide an in-app printable and downloadable Official Receipt slip for any verified payment, displaying institutional university headers, reference numbers, cashier receipt numbers, breakdown of fees, payer identification, and verification stamps.
3. **Counter Claim Hand-off Verification Modal**: Introduce a required claim handoff dialog when marking a request as "Claimed". Staff must record the recipient's name, whether an authorized representative claimed on behalf of the student, and optional identification remarks, updating the request audit log with permanent release provenance.

## User Stories

1. As an administrator, I want to export the filtered Accounts directory to CSV, so that I can audit user distribution across roles and colleges in external spreadsheet software.
2. As an administrator, I want to export the active Document Types catalog to CSV, so that I can inspect institutional fees, turnaround days, and active statuses across all offices.
3. As an office staff member, I want to export my office request queue to CSV, so that I can provide physical handover logs during shift changes.
4. As an office staff member, I want the CSV export to reflect my currently active filters and search terms, so that I only download the specific subset of records I am working with.
5. As an office staff member, I want CSV export filenames to include the view name and current date (e.g., `our-requests-2026-10-28.csv`), so that exported files are easily organized on my desktop.
6. As a system user, I want CSV exports to properly handle commas, quotes, and multiline text in fields like purposes or remarks, so that the spreadsheet does not corrupt when opened in Excel.
7. As a student, I want to view and download an Official Receipt slip once my payment is verified, so that I have formal proof of institutional settlement for my personal records or sponsor reimbursement.
8. As an office staff member, I want to inspect and print the Official Receipt slip directly from the request review workspace, so that I can attach a hard-copy receipt voucher to produced credentials.
9. As an office staff member, I want the Official Receipt to display the cashier receipt number, payment method, amount paid, and verifying officer details, so that financial accountability is maintained.
10. As a student, I want to access my Official Receipt from both the My Requests detail card and the request timeline dialog, so that I can retrieve it from anywhere in my dashboard.
11. As an office staff member, I want a confirmation modal when moving a request status to "Claimed", so that accidental clicks do not prematurely close out in-flight documents.
12. As an office staff member, I want to record whether the document was claimed by the student personally or by an authorized representative, so that proxy pickups are legally documented.
13. As an office staff member, I want to input the representative's full name and authorization ID details during claim handoff, so that fraudulent credential collection is prevented.
14. As an auditor, I want the request timeline and status history to clearly state who released the document and who received custody, so that there is an unbroken chain of custody.
15. As an office staff member, I want the CSV export button to be clearly positioned in table toolbars without cluttering search inputs or pagination controls.
16. As an administrator, I want exported date columns formatted in ISO standard or readable local format, so that dates are easily parsed in data analysis tools.
17. As an office staff member, I want the Official Receipt view to support a clean `@media print` layout, so that printing to paper or saving to PDF omits browser navigation bars and buttons.
18. As a student, I want to see a clear "Payment Verified" badge with a "View Receipt" trigger on my request card, so that I immediately know when payment clearance has completed.
19. As an office staff member, I want the claim handoff action to validate that required recipient fields are provided before completing status transition, so that incomplete releases cannot be recorded.
20. As an office staff member, I want to see the claimant's pickup record summarized in the completed request view, so that subsequent inquiries about who received the document can be answered immediately.

## Implementation Decisions

- **Universal CSV Serializer Module**:
  - Implement a dedicated client-side CSV generator utility with RFC 4180 escaping (wrapping fields containing commas, double quotes, and newlines; doubling interior quotes).
  - Define an export column configuration interface mapping object keys to human-readable header titles with optional value formatters.
  - Implement a client-side Blob download trigger using `URL.createObjectURL` and standard download anchor triggers with automatic URL revocation.
- **Table Toolbar Integration**:
  - Add an `onExport` / `exportConfig` prop to shared table components (`SearchToolbar` and `DataTable`) rendering a standardized "Export CSV" button with a download icon.
  - Wire exports into:
    - Accounts Directory (`AccountsTable.tsx`)
    - Document Management Catalog (`DocumentTable.tsx`)
    - Office Request Queue (`OfficeRequestTable.tsx`)
    - Assigned Requests Queue (`AssignedRequestTable.tsx`)
    - Global Requests (`RequestTable.tsx`)
- **Official Receipt Domain Shape & Dialog**:
  - Create a standard Official Receipt view component (`OfficialReceiptDialog`) rendered in a clean receipt card format with institutional header, receipt number, reference number, payer name, student ID, itemized fees, payment method, verifying cashier/reviewer name, and timestamp.
  - Implement clean print styles (`@media print`) that isolate the receipt container and suppress page chrome.
  - Link receipt triggers in `RequestDetailsCard` (staff review) and `MyRequestDetails` / `RequestTimelineDialog` (student view).
- **Counter Claim Hand-off Modal**:
  - Implement `ClaimHandoffDialog` triggered whenever staff attempts to transition a request to `claimed`.
  - The dialog prompts for:
    - Pickup Type: Student Self vs Authorized Proxy.
    - Claimant Full Name (prefilled with student name if self; empty for proxy).
    - Identification Notes (e.g., "Student ID #2023-00123 verified" or "Authorization letter & National ID #... presented").
  - On confirm, calls `PATCH /api/requests/:id/status` passing `status: "claimed"`, `claimedBy: <claimantName>`, and `note: <identificationNotes>`.

## Testing Decisions

- **Testing Principles**: Focus tests on data integrity, RFC 4180 escaping edge cases, receipt calculation accuracy, and claim validation boundaries rather than ephemeral DOM styling.
- **CSV Serialization Unit Tests**:
  - Test RFC 4180 quote escaping (fields with `"`, `,`, `\n`).
  - Test date formatting and null/undefined handling.
  - Test empty dataset handling.
- **Official Receipt Data Resolver Tests**:
  - Test receipt data extraction from requests with multiple payment attempts (ensuring verified payment is selected).
  - Test fee breakdown formatting and zero-fee waiver handling.
- **Claim Hand-off Validation Tests**:
  - Test that proxy pickup requires claimant name and validation notes.
  - Test that student self-pickup automatically populates student identity.
- **Prior Art**:
  - Builds on unit test patterns in `frontend/src/tests/proof-preview.test.ts`, `frontend/src/tests/timeline-stepper.test.ts`, and `frontend/src/lib/sectors/__tests__/office-staff-filter.test.ts`.

## Out of Scope

- Integrating automated hardware cash registers or ESC/POS thermal receipt printers.
- Third-party bank payment gateway webhooks (payments remain receipt/proof verification based).
- Biometric fingerprint or facial recognition counter verification.
- Backend scheduled automated batch report mailers.

## Further Notes

- Existing database schema in `backend/src/db/schema.ts` already contains `claimedBy`, `claimedAt`, `releasedBy`, `receiptNumber`, and `reviewedBy` on `documentRequests` and `payments` tables. This spec fully operationalizes these existing database fields into the user interface.
