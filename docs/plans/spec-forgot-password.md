# Specification: Self-Service Password Recovery via 6-Digit Email OTP

## Problem Statement

Users (students, faculty, and office staff) who forget their account password currently have no in-app recovery mechanism. When authentication fails, requesters and staff are locked out of document filings and approvals with an error advising them to contact university offices. Without an automated, secure recovery workflow, users experience prolonged access delays and administrative staff face unnecessary manual support burden.

## Solution

A privacy-preserving, in-situ self-service password recovery flow accessible directly from the login interface. Users request a single-use 6-digit verification code sent to their registered institutional email address. Once verified alongside an 8+ character new password, the system hashes the updated credential, invalidates the reset token, closes the modal with confirmation, and allows immediate login without full-page navigation.

## User Stories

1. As a locked-out student, I want to click a "Forgot password?" trigger on the login card, so that I can initiate password recovery without contacting campus administration.
2. As a requester, I want to enter my registered email address in an in-situ modal dialog, so that I receive an official 6-digit recovery code.
3. As a user concerned about privacy, I want the system to confirm code dispatch generically regardless of whether my email exists, so that malicious actors cannot enumerate registered student accounts.
4. As an institutional user, I want the recovery email to display a clean, high-contrast 6-digit verification code, so that I can easily read or copy it on my mobile device.
5. As a student requesting a code, I want the recovery code to remain valid for 10 minutes, so that I have adequate time to check my inbox and complete the form.
6. As a user, I want a 60-second cooldown timer on code resends, so that duplicate dispatch requests and email flood are prevented.
7. As a requester, I want a visible countdown timer for resending the code, so that I know exactly when another email can be requested.
8. As a user entering the recovery code, I want the interface to require an 8-character minimum new password, so that my account maintains the institution's security baseline.
9. As a user setting a new password, I want a password confirmation field, so that I do not accidentally lock myself out with a typo.
10. As a user, I want toggleable password visibility icons on both new and confirm password fields, so that I can inspect what I typed before submitting.
11. As a system administrator, I want incorrect OTP submissions to increment an attempt counter, so that brute-force guessing of the 6-digit code is blocked.
12. As a security officer, I want a recovery token to be permanently locked after 5 consecutive failed attempts, so that account takeovers via OTP guessing are mitigated.
13. As a security officer, I want password reset tokens to be stored as cryptographic hashes in `password_reset_tokens`, so that plain tokens are never stored in the database.
14. As a user who successfully resets their password, I want the recovery token to be flagged as used immediately (`used_at = NOW()`), so that replay attacks are impossible.
15. As a user completing recovery, I want the modal to close, display a success toast, and populate my email address on the login card, so that I can sign in immediately with my new password.
16. As a user entering an expired code (>10 minutes), I want an informative error message directing me to request a fresh code, so that I understand why the reset failed.
17. As a mobile student, I want the recovery dialog to adapt cleanly to small screens without layout breakage or keyboard clipping, so that I can recover my password on my smartphone.

## Implementation Decisions

- **Architecture & Workflow**: Two-step in-situ modal dialog on `LoginCard.tsx` (Step 1: Email entry; Step 2: 6-digit OTP code, New Password, Confirm Password). No new top-level URL routes.
- **Backend API Endpoints**:
  - `POST /api/auth/forgot-password/send-otp`: Accepts `{ email }`. Validates email format. Checks for user. Generates 6-digit OTP, hashes it with bcrypt, saves to `password_reset_tokens` with 10-minute expiry. Dispatches email via `email.service.ts`. Returns generic 200 `{ message: "If an account with this email exists, a verification code has been dispatched." }`.
  - `POST /api/auth/forgot-password/reset`: Accepts `{ email, otp, newPassword }`. Validates email, 6-digit OTP format, and 8+ character password length. Queries active, unused `password_reset_tokens` for the user. Verifies OTP against `token_hash`. If valid, updates `users.password` with new bcrypt hash, sets `used_at = NOW()`, and returns 200.
- **Database Model**: Reuses existing `password_reset_tokens` table in `backend/src/db/schema.ts` (`id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at`).
- **Email Service**: Reuses Brevo HTTPS API in `backend/src/services/email.service.ts` with new dedicated helper `sendPasswordResetOtpEmail(email, otp)` and dev-mode console fallback.
- **Security & Throttling**:
  - 60-second cooldown enforced server-side and client-side between send-otp calls for the same email.
  - Maximum 5 failed OTP attempts before the token is invalidated.
  - Generic 200 on non-existent emails to prevent account enumeration.
- **UX & Post-Reset**: Closes dialog, shows success toast notification via `sonner`, and sets `email` on `LoginCard` state so user only types their new password.

## Testing Decisions

- **Unit & Integration Seams**:
  - **Backend Route Seam**: Test `send-otp` and `reset` endpoints with in-memory database mocks and test runner. Verify:
    1. Valid email generates token hash and invokes email delivery.
    2. Unknown email returns identical generic 200 response without DB write or crash.
    3. Resend within 60s cooldown returns 429 Too Many Requests.
    4. Successful reset updates user password hash and marks token used.
    5. Expired token (>10m) returns 400 Bad Request.
    6. Incorrect OTP returns 400 Bad Request and locks token after 5 attempts.
    7. Reusing an already-used token returns 400 Bad Request.
  - **Frontend Helper & Validation Seam**: Test email format validator, OTP 6-digit mask validator, and 8-character password confirmation validator.

## Out of Scope

- Magic link token URLs and external browser redirection.
- SMS / cellular OTP dispatch.
- Mandatory session revocation on secondary devices (can be added later).
- Administrative manual password override dashboard.

## Further Notes

- Existing database table `password_reset_tokens` is already migrated and structurally ready in Postgres.
- Consistent with existing `sendSignupOtp` architecture in `backend/src/controllers/auth.controller.ts`.
