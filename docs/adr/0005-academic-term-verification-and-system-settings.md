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
4. **COR / Alumni Proof Review Workflow (`account_update_requests`):** Students submit their updated `yearLevel`, `section`, `studentStatus`, and a **Certificate of Registration (COR) Proof** image (or graduation/alumni proof when transitioning to `alumni`). _(Amended 2026-11-21)_ Access to the `/accounts` workspace and **Academic Term Verification** COR review submissions—using **In-Situ Proof Preview** (`FilePreviewDialog`), with atomic profile updates, audit logging, and **Dual Dispatch** notifications on approval or rejection—is restricted exclusively to `admin` users (`staff`, including `OUR` Registrar staff, no longer have access).
5. **Global Login Two-Factor Authentication (`system_settings.loginTwoFactorEnabled`):** Store a global boolean flag (`"true"` / `"false"`, defaulting to `"false"`) in `system_settings`, toggled by System Administrators from `/accounts` via `PATCH /api/settings`. When enabled, `POST /api/auth/login` challenges every role (`student`, `teacher`, `staff`, `admin`) after password verification by sending a **Login Verification OTP** via Brevo (`email_verifications`, 10-minute expiry, 5 attempts, 60-second resend cooldown) and fails closed with HTTP `502` if email delivery fails (retaining dev-console logging when `BREVO_API_KEY` is unset).

## Consequences

### Positive
- Eliminates stale student standing at the start of each academic year while preserving institutional verification via uploaded COR proof.
- Consolidates account directory and **Academic Term Verification** review privileges solely under System Administrators, preventing non-admin `staff` (including `OUR` staff) from accessing `/accounts` or modifying student account standing.
- Centralizes the **Academic Term Anchor** and **Login Two-Factor Authentication (2FA)** in `system_settings` so administrators can enforce Brevo email OTP login security across all accounts without database schema migrations.

### Negative / Trade-offs
- Returning non-alumni students cannot file new document requests at the start of a new academic year until their **Academic Term Verification** is approved by an Admin (in-flight requests remain accessible).
- If an Administrator enables global **Login Two-Factor Authentication (2FA)** while `BREVO_API_KEY` is misconfigured in production, users (including Admins) will fail sign-in with HTTP `502` until Brevo delivery is restored or `loginTwoFactorEnabled` is reset in `system_settings`.
