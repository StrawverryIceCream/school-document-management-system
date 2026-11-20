# 6. Resubmittable Request Rejections and Missed Requirements

Date: 2026-11-20

## Status

Accepted

## Context

Previously, `rejected` was a strictly terminal status (`STATUS_TRANSITIONS.rejected = []`). Requesters could not see the staff's rejection reason (`remarks`) on their request cards or timeline dialog, and any fixable error (such as a blurry scan or missing prerequisite detail) forced the requester to start a brand-new request—losing their `REQ-YYYY-NNNNNN` reference number, verified payments, and review context.

## Decision

1. **In-Place Reopening via `resubmission_allowed`, `missed_requirements`, and `resubmitted_at`:** Keep `rejected` in `request_status` without adding a new enum value, and add `resubmission_allowed` (boolean, default `false`), `missed_requirements` (JSONB array of `{ key, label, type: "file" | "text" | "textarea", required }`), and `resubmitted_at` (timestamptz) to `document_requests`.
2. **Staff-Controlled Rejection Mode:** During **Request Rejection**, staff always provide public `remarks` explaining why the request was rejected, and may optionally toggle **"Allow requester to resubmit with Missed Requirements"** to configure 1–10 structured items. Re-rejecting after a resubmission may enable resubmission again across multiple rounds, or leave it disabled for final denials.
3. **In-Place Resubmission (`POST /api/requests/me/:id/resubmit`):** Requesters upload missing PDF/JPG/PNG/WebP attachments to `request_attachments` and supply text answers merged into `form_data`. The request transitions back from `rejected` to `pending`, preserves its reference number and existing payments, resets `resubmission_allowed = false` and `missed_requirements = []`, stamps `resubmitted_at`, and appends to `request_status_history`.

## Consequences

### Positive
- Requesters keep their reference number, verified payments, and audit history across multiple rejection-and-resubmission rounds.
- Staff can cleanly separate fixable rejections from permanent ineligibility denials with zero enum migration downtime.

### Negative / Trade-offs
- Code treating `rejected` as unconditionally terminal (such as duplicate-request guards) must inspect `resubmissionAllowed` so resubmittable rejections remain actionable.
