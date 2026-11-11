import assert from "node:assert";
import bcrypt from "bcrypt";
import {
  calculateRecoveryCooldown,
  isTokenExpired,
  validateOtpCode,
  validateRecoveryEmail,
  validateRecoveryPassword,
} from "../controllers/auth.controller.js";

console.log("Running self-service password recovery unit tests...");

// 1. Email validation & normalization
assert.strictEqual(
  validateRecoveryEmail("  student@university.edu.ph  ").valid,
  true,
);
assert.strictEqual(
  validateRecoveryEmail("  student@university.edu.ph  ").normalized,
  "student@university.edu.ph",
);
assert.strictEqual(
  validateRecoveryEmail("INVALID-EMAIL").valid,
  false,
);
assert.strictEqual(
  validateRecoveryEmail("").valid,
  false,
);

// 2. OTP format validation (strict 6-digit)
assert.strictEqual(validateOtpCode("123456"), true);
assert.strictEqual(validateOtpCode("000000"), true);
assert.strictEqual(validateOtpCode("12345"), false);
assert.strictEqual(validateOtpCode("1234567"), false);
assert.strictEqual(validateOtpCode("abc123"), false);
assert.strictEqual(validateOtpCode(""), false);

// 3. Password policy validation (minimum 8 characters)
assert.strictEqual(validateRecoveryPassword("password123").valid, true);
assert.strictEqual(validateRecoveryPassword("12345678").valid, true);
assert.strictEqual(validateRecoveryPassword("short").valid, false);
assert.strictEqual(validateRecoveryPassword("").valid, false);

// 4. Cooldown calculation (60s)
const now = new Date("2026-11-12T10:00:00Z");
const recent20s = new Date(now.getTime() - 20 * 1000);
const cooldownActive = calculateRecoveryCooldown(recent20s, now);
assert.strictEqual(cooldownActive.active, true);
assert.strictEqual(cooldownActive.waitSeconds, 40);

const older80s = new Date(now.getTime() - 80 * 1000);
const cooldownExpired = calculateRecoveryCooldown(older80s, now);
assert.strictEqual(cooldownExpired.active, false);
assert.strictEqual(cooldownExpired.waitSeconds, 0);

// 5. Expiry check (10 minutes)
const validExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
assert.strictEqual(isTokenExpired(validExpiresAt, now), false);

const pastExpiresAt = new Date(now.getTime() - 1000);
assert.strictEqual(isTokenExpired(pastExpiresAt, now), true);

// 6. Bcrypt OTP hashing compatibility
const testOtp = "849201";
const hash = await bcrypt.hash(testOtp, 10);
assert.strictEqual(await bcrypt.compare(testOtp, hash), true);
assert.strictEqual(await bcrypt.compare("111111", hash), false);

console.log("Password recovery unit tests passed successfully!");

