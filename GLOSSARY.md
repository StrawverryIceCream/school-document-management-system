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
