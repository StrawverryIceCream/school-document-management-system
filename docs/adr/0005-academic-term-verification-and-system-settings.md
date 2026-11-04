# 5. Academic Term Verification Gate and Dynamic System Settings

Date: 2026-11-03

## Status

Accepted

## Context

Previously, the institutional **Academic Term Anchor** (`AY 2026–2027`) was hardcoded in `frontend/src/lib/constants.ts`, and a student's academic standing (`yearLevel`, `section`, `studentStatus`) remained static after initial `/signup`. When a new academic year begins, returning students advance in year level, change sections, or transition to `graduating` / `alumni` status—directly affecting **Document Eligibility**. Without a verification gate tied to the active academic term, students could file document requests under stale academic standing, or would require manual administrator edits for every single student each year.

## Decision

1. **Dynamic System Settings (`system_settings`):** Store global configuration (starting with `activeAcademicTerm`, seeded to `"AY 2026–2027"`) in a `system_settings` key-value table exposed publicly via `GET /api/settings` and mutable by administrators via `PATCH /api/settings`. All portal surfaces (Landing, Login, Signup, Home, and Staff Dashboard) read the live **Academic Term Anchor** from this setting with a constant fallback.
2. **Per-Student Term Verification Tracking (`users.verified_academic_term`):** Track the last academic term for which a student's academic standing was verified. Newly registered students via `/signup` are automatically stamped with the active `activeAcademicTerm`.
3. **Hard Gate on New Document Requests:** Non-alumni students whose `verifiedAcademicTerm` does not match the active `activeAcademicTerm` are prompted on `/home` and gated on `/new-request` until their **Academic Term Verification** request for the active term is approved. Existing `alumni` students are exempt because alumni status is terminal across academic terms.
4. **COR / Alumni Proof Review Workflow (`account_update_requests`):** Students submit their updated `yearLevel`, `section`, `studentStatus`, and a **Certificate of Registration (COR) Proof** image (or graduation/alumni proof when transitioning to `alumni`). Both Administrators and Office of the University Registrar (`OUR`) staff review submissions in the `/accounts` workspace using **In-Situ Proof Preview** (`FilePreviewDialog`), with atomic profile updates, audit logging, and **Dual Dispatch** notifications on approval or rejection.

## Consequences

### Positive
- Eliminates stale student standing at the start of each academic year while preserving institutional verification via uploaded COR proof.
- Shares review load between System Administrators and Registrar (`OUR`) staff without granting `OUR` staff destructive account management privileges.
- Centralizes the **Academic Term Anchor** in `system_settings` so advancing the school year updates all public and authenticated banners simultaneously.

### Negative / Trade-offs
- Returning non-alumni students cannot file new document requests at the start of a new academic year until their **Academic Term Verification** is approved by an Admin or `OUR` staff member (in-flight requests remain accessible).
