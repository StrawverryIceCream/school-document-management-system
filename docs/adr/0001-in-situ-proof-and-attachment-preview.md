# 1. In-Situ Proof and Attachment Preview in Request Review

Date: 2026-10-28

## Status

Accepted

## Context

When institutional reviewers (office staff and registrars) evaluate document requests in `RequestDetailsCard`, verifying student-uploaded payment proofs and supporting verification documents previously required clicking external anchor tags (`target="_blank"`). This opened raw Cloudinary or storage URLs in new browser tabs, pulling staff out of the active review flow, desynchronizing scroll positions, and cluttering the desktop with orphaned tabs during high-volume review sessions.

## Decision

1. Implement an **In-Situ Proof & Attachment Previewer** via a reusable `FilePreviewDialog` component powered by Radix/shadcn `Dialog`.
2. Replace external tab anchors in `RequestDetailsCard` with in-situ triggers (`Preview Proof` / `Preview Attachment`) that open the file within a viewport-constrained modal.
3. Keep the viewer strictly observational: display key metadata (payment amounts, method, reference numbers, dates) for cross-referencing, while keeping all workflow mutations (approve, reject, cancel) centralized in `RegistrarReviewCard`.
4. Support multi-format inspection: responsive image rendering (`<img>`) for snapshots, embedded viewers (`<iframe>`) for PDFs, and an external download escape hatch for unsupported formats.

## Consequences

### Positive
- Reviewers verify payments and attachments without losing context or scroll location.
- Key payment metadata is visible directly adjacent to the visual receipt for immediate verification.
- Consistent preview experience shared across both payment proofs and student eligibility attachments.

### Negative / Trade-offs
- Very large images or high-resolution PDFs require responsive constraints (`max-h-[75vh]`) and scrollable dialog containers.
- Does not allow image markup or annotation; inspection remains strictly read-only.
