# Spec: Role-Based Notifications & Staff Alerts

Addresses #39 and #41.

## Problem Statement

Users of the school document management system currently lack immediate visibility when critical lifecycle events occur on document requests:
1. Requesters (students and teachers) do not reliably receive actionable status change alerts or payment confirmations in their inbox or in real time, forcing them to repeatedly check their request dashboard manually.
2. Office staff members are not notified when new document requests are submitted for their assigned office, requiring them to constantly poll and refresh their review queue to discover new work.
3. Administrative personnel lack automated notification delivery auditing, and previous notifications do not update dynamically without full manual browser reloads.

## Solution

A cohesive, role-driven notification system featuring:
1. **Dual Dispatch (In-App + Email)**: Whenever a document request status changes, payment is received, or a new request is created, the system records an in-app notification for the user and triggers an email notification in the background.
2. **Office Staff Fan-Out**: When a student or faculty member submits a new document request, all active staff members belonging to that document's assigned office receive an alert in their notification feed.
3. **Automated Status Triggers**: Centralized notification triggers integrated directly into request status transitions (`submitted`, `awaiting_payment`, `processing`, `ready`, `claimed`, `rejected`) and payment verification flows.
4. **Active Feed Polling**: Background polling on the frontend notification provider to keep badge counts and notification feeds fresh without manual page reloads.

## User Stories

1. As a student requester, I want to receive an in-app notification when my document request is accepted and marked as processing, so that I know staff are working on my document.
2. As a student requester, I want to receive an email notification when my document request is ready for pickup, so that I know when to visit the campus office even if I am not logged into the portal.
3. As a student requester, I want my pickup email to include the scheduled release date and digital copy link if available, so that I have all necessary pickup details immediately.
4. As a student requester, I want to receive an in-app notification and email if my request is rejected, so that I understand why and can resubmit with corrected information.
5. As a student requester, I want to receive an in-app and email confirmation when my payment is verified, so that I know my request has officially moved into production.
6. As a teacher requester, I want to receive identical status update notifications for my employee document requests, so that I can track certificate requests seamlessly.
7. As an office staff member, I want to receive an in-app notification whenever a student submits a new request for my office, so that I can promptly begin review without polling the queue.
8. As an office staff member, I want to see which specific document and reference number arrived in the notification title and message, so that I have immediate context before opening the request.
9. As an office staff member, I only want to receive notifications for documents belonging to my assigned office, so that my feed is not cluttered with unrelated requests from other departments.
10. As an office staff member, I want my notification count to update periodically in the background, so that I see new requests arrive while working on other pages.
11. As an office staff member, I want to be able to mark notifications as read individually or all at once, so that my unread count reflects only pending alerts.
12. As a system administrator, I want notification and email dispatch errors to be logged without failing the user's primary HTTP action, so that requests and status updates remain robust even if an email service encounters a temporary timeout.
13. As a system administrator, I want email dispatch in local development environments to safely log email payloads to the console when SMTP credentials are not configured, so that local development and automated tests run smoothly without external dependencies.
14. As an institutional user, I want clicking a request notification to link directly to the corresponding request details page, so that I can take immediate action with one click.

## Implementation Decisions

- **Shared Notification Dispatcher**: Create a unified backend notification service module responsible for handling dual dispatch (in-app DB row insertion + async email sending). All controllers (requests, payments, review) will call this single dispatcher rather than invoking database queries and mailers directly.
- **Office Fan-Out Query**: When a document request is created, query the users collection for users matching `role = 'staff'` and `officeId = targetOfficeId`. Insert notification rows for all matching staff.
- **Async Non-Blocking Email**: Email dispatch operations will run as fire-and-forget asynchronous promises from the notification service. Failures in sending emails will update the local audit/error logs but will never abort the database transaction or cause the HTTP response to return an error status to the user.
- **Status Event Hooking**: Hook into the request update controller at the exact point where status transitions occur. Map each status transition to appropriate user-friendly message copy and subject lines.
- **Frontend Interval Polling**: Enhance the notification provider to run an interval timer (30-second interval) while the user session is authenticated. Clear the interval on unmount or logout.
- **Schema & Database Alignment**: Use existing notifications table fields (`userId`, `senderId`, `requestId`, `type`, `title`, `message`, `isRead`, `emailSentAt`). No breaking schema changes or table rebuilds required.
- **Email Development Mode**: Maintain existing fallback behavior in the email transport layer to log full email contents and OTPs to stdout when SMTP credentials are absent from environment variables.

## Testing Decisions

- **Testing Principle**: Tests should verify the observable behavior of the notification dispatch service and controllers (e.g. verifying that records are inserted with correct fields, fan-out selects the right staff, and email dispatch is invoked), rather than testing internal nodemailer socket mechanics.
- **Modules Tested**:
  - The notification dispatch service functions (`notifyUser`, `notifyOfficeStaff`).
  - Request creation controller event hook (verifying office staff fan-out).
  - Request status transition controller event hook (verifying requester notification).
- **Prior Art**: Follow the existing pattern established in the test suite using standalone test scripts run via the TypeScript runtime with assertions against direct database state and mock controller responses.

## Out of Scope

- Real-time WebSocket or Server-Sent Events (SSE) streaming infrastructure.
- User-customizable notification preference matrices (e.g. disabling email while keeping in-app).
- Marketing, bulk announcements, or SMS messaging channels.
- Push notifications via mobile OS bridges or browser ServiceWorkers.

## Further Notes

- Relates directly to existing GitHub issues #39 and #41.
- Triage label `ready-for-agent` will be applied upon publication.
