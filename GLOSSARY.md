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

**Document Eligibility**:
The role and student status criteria defining whether a document type is available for filing by a specific user.
_Avoid_: Permission level, record accessibility

**Office Shortcut**:
A one-click filter preset that scopes the global request view to an institutional office or the user's home office.
_Avoid_: Quick link, bookmark tab

**Request Rejection**:
An institutional compliance determination made by office staff denying the fulfillment of a document request due to unfulfilled prerequisites, academic ineligibility, or invalid documentation. Remarks are communicated to the requester.
_Avoid_: Cancel, decline, drop

**Request Cancellation**:
The administrative termination or voluntary requester withdrawal of an in-flight or ready document request, stopping fulfillment without academic non-compliance fault.
_Avoid_: Reject, delete, trash

**Canned Reason Preset**:
A standardized, selectable institutional explanation template (e.g., missing attachments, unsettled obligations, duplicate submission) that populates public remarks or cancellation reasons with consistent institutional phrasing.
_Avoid_: Quick message, canned excuse, boilerplate text

**Public Request Tracking**:
An unauthenticated, privacy-preserving tracking view allowing requesters to inspect stage progression, designated counter windows, and estimated release dates using an institutional reference number (`REQ-YYYY-NNNNNN`) without exposing student identity or personal contact information.
_Avoid_: Global lookup, ticket search, open request viewer

**Academic Term Anchor**:
The institutional academic year and semester (e.g., `AY 2026–2027`) displayed across public portals and operational dashboards to contextualize document validity, eligibility verification, and active queue cycles.
_Avoid_: School year banner, active semester label, date tag

## Staff and Offices

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
The role-based navigation model that restricts a staff user's sidebar sectors and divisions to their designated office and organizational unit.
_Avoid_: Siloed view, locked tab, filtered portal

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

## Request Review and Verification

**In-Situ Proof Preview**:
An in-page modal or inspection overlay allowing office staff to examine payment receipts, bank deposit slips, and supporting requirements directly within the request review card without navigating away or opening external browser tabs.
_Avoid_: External tab viewer, artifact link, popup window

**Payment Proof**:
A digital receipt, bank confirmation slip, or electronic transaction screenshot uploaded by a requester to substantiate settlement of document assessment fees.
_Avoid_: Payment artifact, receipt file, transaction attachment

