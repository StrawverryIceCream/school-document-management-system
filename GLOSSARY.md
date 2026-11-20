# School Document Management System

Full-stack document tracking and request fulfillment platform for students, faculty, and administrative staff.

## Notifications

**In-App Notification**:
A persistent alert associated with a user account, displayed in the application navigation and tracking read status.
_Avoid_: Popup, toast, modal alert

**Email Notification**:
A transactional email dispatched to a user's verified email address to alert them of major lifecycle events.
_Avoid_: Marketing email, newsletter, digest

**Dual Dispatch**:
The synchronous creation of an In-App Notification paired with asynchronous dispatch of an Email Notification from a single domain event.
_Avoid_: Broadcast, batch send

**Office Staff Fan-Out**:
The delivery of a single document request notification to all active staff members assigned to the processing office.
_Avoid_: Department blasting, global notification

**Requester**:
A student or faculty user who creates and submits a document request.
_Avoid_: Applicant, customer, client

**Office Staff**:
An institutional user assigned to a specific office who reviews, processes, and marks document requests.
_Avoid_: Agent, worker, clerk

## Request and Student View

**Student Status**:
The academic standing of a student user (regular, irregular, graduating, alumni) determining record entitlement.
_Avoid_: Enrollment type, student level, year tier

**Requester Profile**:
The role-specific institutional identity summary of a Requester (such as student program and standing, faculty department, or staff office assignment) presented during request filing and staff review.
_Avoid_: Applicant profile, student profile, user card

**Document Eligibility**:
The role and student status criteria defining whether a document type is available for filing by a specific user.
_Avoid_: Permission level, record accessibility

**Office Shortcut**:
A one-click filter preset that scopes the global request view to an institutional office or the user's home office.
_Avoid_: Quick link, bookmark tab

**Request Rejection**:
An institutional compliance determination made by office staff denying fulfillment of a document request due to unfulfilled prerequisites, academic ineligibility, or invalid documentation; may be final or resubmittable with Missed Requirements across multiple rounds. Remarks are communicated to the requester.
_Avoid_: Cancel, decline, drop

**Missed Requirements**:
Structured items (file upload, short text, or detailed text) configured by office staff during a resubmittable Request Rejection that the requester must supply to reopen the request in-place.
_Avoid_: Missing requirements, revision checklist, fix list

**Request Cancellation**:
The administrative termination or voluntary requester withdrawal of an in-flight or ready document request, stopping fulfillment without academic non-compliance fault.
_Avoid_: Reject, delete, trash

**Canned Reason Preset**:
A standardized, selectable institutional explanation template (e.g., missing attachments, unsettled obligations, duplicate submission) that populates public remarks or cancellation reasons with consistent institutional phrasing.
_Avoid_: Quick message, canned excuse, boilerplate text

**Public Request Tracking**:
An unauthenticated, privacy-preserving tracking view allowing requesters to inspect stage progression, designated processing offices, and estimated release dates using an institutional reference number (`REQ-YYYY-NNNNNN`) without exposing student identity or personal contact information.
_Avoid_: Global lookup, ticket search, open request viewer

**Academic Term Anchor**:
The institutional academic year and semester (e.g., `AY 2026–2027`) displayed across public portals and operational dashboards to contextualize document validity, eligibility verification, and active queue cycles.
_Avoid_: School year banner, active semester label, date tag

**Academic Term Verification**:
A student-submitted request containing updated academic standing (`yearLevel`, `section`, `studentStatus`) and a Certificate of Registration (COR) Proof image to synchronize their account with the active Academic Term Anchor.
_Avoid_: Profile update ticket, year level bump, account renewal

**Certificate of Registration (COR) Proof**:
An official enrollment record image uploaded by a student to substantiate their year level, section, and student status for a new academic term.
_Avoid_: Enrollment slip, registration attachment, schedule screenshot

**Responsive Viewport Tiers**:
The design and layout adaptation strategy that prioritizes actionable workflows, suppresses non-critical decorative cards on mobile viewports (<768px), and scales navigation chrome to maximize viewport usability.
_Avoid_: Mobile stripping, selective hiding, responsive cutting

**Status Tab Rail**:
A touch-scrollable, single-row horizontal track of segmented status filter tabs with intrinsic widths (`shrink-0 w-auto`), enabling one-tap lifecycle filtering on mobile viewports (<768px) without text clipping, squishing, or label overlap.
_Avoid_: Squished tabs, multi-line tab cluster, accordion filter

## Staff and Offices

**Processing Office**:
The academic or administrative organizational unit (e.g. Office of the University Registrar, HRMO, College Dean's Office) responsible for reviewing, endorsing, and releasing a requested document.
_Avoid_: Service window, counter window, releasing window

**College Academic Offices**:
The public directory and navigational section highlighting academic unit headquarters, processing hours, and document queue load across degree-granting colleges.
_Avoid_: College windows, evaluation windows, counter windows

**Staff Delegation**:
Assigning operational custody of a document request to a specific active staff member within the issuing office.
_Avoid_: Task dispatch, ticket routing, handing over

**Assignee**:
The active office staff member currently responsible for processing, inspecting, and completing an assigned document request.
_Avoid_: Handler, owner, processor

**Office Counter Load**:
The aggregate volume of active in-flight document requests currently awaiting review, production, or release in an operational office.
_Avoid_: Window queue, counter traffic, ticket backlog

**Scoped Workspace**:
The role-based navigation model that restricts a staff user's sidebar sectors, divisions, Quick Jump targets, and route access to their designated office and organizational unit.
_Avoid_: Siloed view, locked tab, filtered portal

**Quick Jump**:
The keyboard-accessible command palette (`Cmd+K` / `Ctrl+K`) that surfaces only the navigation destinations and actions permitted for the signed-in user's role and assigned office.
_Avoid_: Global search bar, universal menu, shortcut modal

**Sector Request Review**:
The institutional staff review workspace providing comprehensive multi-card inspection of document requests, requester profile and standing, compliance prerequisites, payment verification, and status advancement within a processing office.
_Avoid_: Window review, counter review, ticket details view

**Assigned Requests Workspace**:
A dedicated operational queue and triage surface allowing office staff and administrators to inspect, organize by urgency/status, and review all document requests for which they hold operational custody.
_Avoid_: My tickets, tasks tab, personal inbox

**Workload Triage**:
The categorization and prioritization of assigned document requests according to service-level agreement (SLA) deadlines, processing status, and action requirements.
_Avoid_: Ticket sorting, backlog pruning

## Accounts and Search

**Unified Account Search**:
The multi-field query evaluation across user identity (full name, email, student ID) and organizational placement (assigned office code/name, department) within the accounts directory.
_Avoid_: User filtering, profile lookup, global search

**Account Suspension Lifecycle**:
The active or suspended operational state of a user account governing authentication access without deleting historical audit trails or submitted records.
_Avoid_: User disabling, account ban, soft delete

**Role Transition Sanitization**:
The automatic cleanup and nullification of mutually exclusive role attributes (such as student program records vs. staff office assignments) during user role changes to maintain relational integrity.
_Avoid_: Credential reset, role switching wipe

**Self-Service Password Recovery**:
The unauthenticated verification and password reset workflow allowing users to regain account access via a time-bounded 6-digit email OTP without administrative intervention.
_Avoid_: Password reset link, admin unlock, credential recovery wizard

**Password Reset OTP**:
A cryptographically hashed, single-use 6-digit numerical token dispatched to a user's verified institutional email address with a 10-minute validity window and attempt throttling.
_Avoid_: Reset code, unlock pin, magic token

**Login Two-Factor Authentication (2FA)**:
An administrator-controlled institutional login security policy requiring every password sign-in to complete an email verification code challenge before access is granted.
_Avoid_: MFA toggle, global lock, SMS auth

**Login Verification OTP**:
A single-use, cryptographically hashed numerical code sent to a user's registered email address during password login when **Login Two-Factor Authentication (2FA)** is enabled, subject to expiry and attempt limits.
_Avoid_: Login pin, session code, magic link

## Request Review and Verification

**In-Situ Proof Preview**:
An in-page modal or inspection overlay allowing office staff to examine payment receipts, bank deposit slips, and supporting requirements directly within the request review card without navigating away or opening external browser tabs.
_Avoid_: External tab viewer, artifact link, popup window

**Institutional Payment Portal**:
The in-app settlement modal and options interface presenting verified payment channels, official QR codes (e.g. MariBank / QR Ph), and account details to requesters before receipt proof submission.
_Avoid_: Payment gateway, checkout screen, billing window

**Settlement QR Ph Code**:
An official interoperable QR code image rendered in the settlement interface, scannable across digital banking apps and e-wallets to direct document assessment fee transfers to the institution's account.
_Avoid_: Payment QR pic, transfer snapshot, cashier scan

**Payment Proof**:
A digital receipt, bank confirmation slip, or electronic transaction screenshot uploaded by a requester to substantiate settlement of document assessment fees.
_Avoid_: Payment artifact, receipt file, transaction attachment

**Official Receipt (OR) Slip**:
A formal institutional voucher generated upon payment verification displaying university transaction reference numbers, official receipt serials, breakdown of assessed fees, payer identity, and cashier verification stamps.
_Avoid_: Payment summary, invoice card, billing ticket

**Claim Hand-Off**:
The in-person counter verification procedure where office staff records recipient identity, inspects valid identification, and logs release custody before moving a request status to claimed.
_Avoid_: Pickup finish, handover close, physical dispatch

**Table CSV Export**:
The client-side generation and download of an RFC 4180-compliant CSV spreadsheet reflecting the active search, filter criteria, and column formatting of an operational table view.
_Avoid_: Dump file, raw data export, sheet rip

**Fee Refund**:
The manual return of settled document assessment fees by the Cashier's Office after a paid document request ends in Request Cancellation or final Request Rejection prior to fulfillment.
_Avoid_: Chargeback, auto-reversal, fee credit

**Verify-Then-Refund Gate**:
The financial safeguard requiring Cashier's Office staff to confirm that an unverified Payment Proof actually settled in the institution's account before approving and disbursing a Fee Refund.
_Avoid_: Blind voiding, instant refund, unverified payout

**Refund Disbursement Proof**:
The transaction reference number or counter release log recorded by the Cashier's Office when completing a Fee Refund via e-wallet, bank transfer, or cash counter pickup, marking any issued Official Receipt (OR) Slip as refunded.
_Avoid_: Payout receipt, refund attachment, reversal slip

**Refund Claim**:
The requester-initiated submission of payout channel details and an optional Receiving Refund QR Code to claim a Fee Refund after a paid document request is cancelled or permanently rejected.
_Avoid_: Reimbursement ticket, payout form, chargeback claim

**Receiving Refund QR Code**:
A personal e-wallet or bank QR code image uploaded by a requester during Request Cancellation or Refund Claim so Cashier's Office staff can scan and transfer a Fee Refund directly.
_Avoid_: Student payment QR, personal scan pic


