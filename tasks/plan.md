# Implementation Plan: Email OTP for User Signup

## Overview
Add email One-Time Password (OTP) verification to the user signup flow in the ARCH School Document Management System. Before an account is registered in the database, the user must prove ownership of their institutional email address by entering a time-sensitive 6-digit OTP sent to their inbox.

---

## Architecture Decisions
1. **Verification Strategy (Pre-Registration Verification):** Verified before inserting into `users`, avoiding unverified zombie accounts.
2. **Email Delivery via Nodemailer with Dev Fallback:** Logs OTP to server console if SMTP credentials are not configured.
3. **Frontend UX:** Clean modal dialog prompting for 6-digit code with 60-second cooldown timer.
4. **Security:** Cryptographic 6-digit generation, bcrypt hashing, 10-minute expiry, max 5 attempts.
