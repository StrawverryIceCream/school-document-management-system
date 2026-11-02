# 2. Retire Physical Service Windows in Favor of Office Custody and Live QR Handoff

Date: 2026-11-02

## Status

Accepted

## Context

The initial review screen, tracking views, and public landing pages modeled document pickup around physical "Service Windows" (e.g., `Window 1 (Registrar Evaluation Desk)`, `College Counter Windows`). In practice:
1. Academic and administrative operations organize request routing, custody, and staff delegation by **Offices** (e.g., Office of the University Registrar, Human Resource Management Office, College Deans' Offices), not static numbered counter windows.
2. The review screen's `WindowOperationsCard` displayed a static, non-functional SVG illustration rather than a live scannable QR voucher for document release.
3. Conflating "Windows" with "Offices" created ambiguity across the operational queue, audit pipeline, landing page discovery, and public status dialogues.

## Decision

1. **Retire "Window" Terminology in Review UI:** Replace all operational and pipeline references to physical "Windows" with institutional "Offices" across `SectorRequestReview`, `OfficeOperationsCard`, `WorkflowPipelineCard`, `ComplianceChecklistCard`, and `RequestDetailsCard`.
2. **Align Public Landing Page (`LandingPage`):**
   - Rename public catalog section from "College Counter Windows" to "College Academic Offices" (`OFFICES_SECTION` with `#offices` anchor).
   - Update navigation (`LandingNav`), announcement bar, hero ticket metadata, footer directory links, and public tracking stages (`TrackRequest`) to refer to "Processing Office" and "Office Claim" instead of counter windows.
   - Retain `#windows` anchor support and `CollegeWindows` export alias to preserve backward compatibility for existing bookmarks and external links.
3. **Implement Live QR Handoff:** In `OfficeOperationsCard`, replace the static mock SVG with `QRCodeSVG` from `qrcode.react`, encoding the standard claim route (`/requests/claim?ref=<REF>`) and providing a one-click clipboard copy for the claiming link.
4. **Preserve Relational Integrity:** Keep existing database relations (`window_id`) untouched in the backend to avoid destructive database migrations while presenting the canonical "Processing Office" model to all frontend reviewers.

## Consequences

### Positive
- Review UI and public landing page terminology align cleanly with the multi-sector organizational model defined in `GLOSSARY.md`.
- Reviewers and release desk staff can scan live QR codes directly from the screen with handheld scanners or copy the claim verification link.
- Public requesters experience consistent institutional vocabulary across the hero, college unit directory, footer, and tracking stepper.
- Resolves inconsistencies between physical counter window metaphors and decentralized office operations.

### Negative / Trade-offs
- Underlying database schema retains legacy `windows` and `window_id` fields for backwards compatibility with historical rows until a future schema migration.
