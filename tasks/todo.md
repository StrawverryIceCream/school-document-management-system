# Task List: Email OTP for User Signup

## Phase 1: Foundation (Backend Schema & Mailer)
- [x] Task 1: Add `email_verifications` table in `backend/src/db/schema.ts` and generate migration.
- [x] Task 2: Create lightweight email transport service (`backend/src/services/email.service.ts`) with dev console fallback.

## Phase 2: Core OTP Endpoints (Backend API)
- [x] Task 3: Implement `POST /api/auth/send-otp` in `backend/src/controllers/auth.controller.ts` with 60s cooldown.
- [x] Task 4: Require and verify OTP in `POST /api/auth/signup` and set `emailVerifiedAt`.

## Phase 3: Frontend Integration
- [x] Task 5: Add OTP auth client methods in `frontend/src/api/auth.ts`.
- [x] Task 6: Build `OtpVerificationModal` and wire into `RegistrationForm.tsx`.
