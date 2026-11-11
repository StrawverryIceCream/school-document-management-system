import assert from "node:assert";
import test from "node:test";
import {
  formatCooldownCountdown,
  validateRecoveryEmail,
  validateRecoveryOtp,
  validateRecoveryPasswordPair,
} from "../lib/auth/forgot-password";

test("forgot password client validation helpers", async (t) => {
  await t.test("validateRecoveryEmail validates and trims email", () => {
    assert.strictEqual(
      validateRecoveryEmail("student@university.edu.ph").valid,
      true,
    );
    assert.strictEqual(
      validateRecoveryEmail("  user@school.edu  ").normalized,
      "user@school.edu",
    );
    assert.strictEqual(validateRecoveryEmail("invalid-email").valid, false);
    assert.strictEqual(validateRecoveryEmail("").valid, false);
  });

  await t.test("validateRecoveryOtp accepts strictly 6 digits", () => {
    assert.strictEqual(validateRecoveryOtp("123456"), true);
    assert.strictEqual(validateRecoveryOtp("000000"), true);
    assert.strictEqual(validateRecoveryOtp("12345"), false);
    assert.strictEqual(validateRecoveryOtp("1234567"), false);
    assert.strictEqual(validateRecoveryOtp("abc123"), false);
  });

  await t.test("validateRecoveryPasswordPair enforces 8+ chars and matching confirmation", () => {
    const validMatch = validateRecoveryPasswordPair(
      "password123",
      "password123",
    );
    assert.strictEqual(validMatch.valid, true);

    const tooShort = validateRecoveryPasswordPair("pass", "pass");
    assert.strictEqual(tooShort.valid, false);
    assert.strictEqual(
      tooShort.error,
      "Password must be at least 8 characters",
    );

    const mismatch = validateRecoveryPasswordPair(
      "password123",
      "differentPass",
    );
    assert.strictEqual(mismatch.valid, false);
    assert.strictEqual(mismatch.error, "Passwords do not match");
  });

  await t.test("formatCooldownCountdown formats seconds into mm:ss", () => {
    assert.strictEqual(formatCooldownCountdown(60), "1:00");
    assert.strictEqual(formatCooldownCountdown(45), "0:45");
    assert.strictEqual(formatCooldownCountdown(5), "0:05");
    assert.strictEqual(formatCooldownCountdown(0), "0:00");
  });
});

