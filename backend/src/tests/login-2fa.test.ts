import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { parseBooleanSetting } from "../controllers/settings.controller.js";
import {
  checkLoginOtpVerification,
  decideLoginChallengeAction,
  evaluateLoginOtpState,
  normalizeLoginEmail,
} from "../controllers/auth.controller.js";

console.log("Running login 2FA unit tests...");

// 1. Boolean system setting parser
assert.equal(parseBooleanSetting(true), true);
assert.equal(parseBooleanSetting(false), false);
assert.equal(parseBooleanSetting("true"), true);
assert.equal(parseBooleanSetting(" TRUE "), true);
assert.equal(parseBooleanSetting("1"), true);
assert.equal(parseBooleanSetting("false"), false);
assert.equal(parseBooleanSetting("0"), false);
assert.equal(parseBooleanSetting(""), false);
assert.equal(parseBooleanSetting("invalid", false), false);
assert.equal(parseBooleanSetting(undefined, true), true);

// 2. Login 2FA state machine
assert.equal(evaluateLoginOtpState({ twoFactorEnabled: false }), "bypass");
assert.equal(
  evaluateLoginOtpState({ twoFactorEnabled: false, otp: "123456" }),
  "bypass",
);
assert.equal(
  evaluateLoginOtpState({ twoFactorEnabled: true }),
  "challenge",
);
assert.equal(
  evaluateLoginOtpState({ twoFactorEnabled: true, otp: "   " }),
  "challenge",
);
assert.equal(
  evaluateLoginOtpState({
    twoFactorEnabled: true,
    otp: "123456",
    resend: true,
  }),
  "challenge",
);
assert.equal(
  evaluateLoginOtpState({
    twoFactorEnabled: true,
    otp: "123456",
    resend: false,
  }),
  "verify",
);

// 3. OTP verification checks
const now = new Date("2026-11-21T03:30:00Z");
const validHash = await bcrypt.hash("654321", 10);

const missingResult = await checkLoginOtpVerification({
  verification: null,
  otp: "654321",
  now,
});
assert.equal(missingResult.ok, false);
if (!missingResult.ok) {
  assert.match(missingResult.error, /No active verification code/i);
}

const expiredResult = await checkLoginOtpVerification({
  verification: {
    otpHash: validHash,
    expiresAt: new Date(now.getTime() - 1000),
    attempts: 0,
  },
  otp: "654321",
  now,
});
assert.equal(expiredResult.ok, false);
if (!expiredResult.ok) {
  assert.equal(expiredResult.shouldDelete, true);
  assert.match(expiredResult.error, /expired/i);
}

const exhaustedResult = await checkLoginOtpVerification({
  verification: {
    otpHash: validHash,
    expiresAt: new Date(now.getTime() + 60_000),
    attempts: 5,
  },
  otp: "654321",
  now,
});
assert.equal(exhaustedResult.ok, false);
if (!exhaustedResult.ok) {
  assert.equal(exhaustedResult.shouldDelete, true);
  assert.match(exhaustedResult.error, /Too many failed attempts/i);
}

const wrongAttemptResult = await checkLoginOtpVerification({
  verification: {
    otpHash: validHash,
    expiresAt: new Date(now.getTime() + 60_000),
    attempts: 2,
  },
  otp: "000000",
  now,
});
assert.equal(wrongAttemptResult.ok, false);
if (!wrongAttemptResult.ok) {
  assert.equal(wrongAttemptResult.nextAttempts, 3);
  assert.match(wrongAttemptResult.error, /2 attempt\(s\) remaining/);
}

const fifthWrongResult = await checkLoginOtpVerification({
  verification: {
    otpHash: validHash,
    expiresAt: new Date(now.getTime() + 60_000),
    attempts: 4,
  },
  otp: "000000",
  now,
});
assert.equal(fifthWrongResult.ok, false);
if (!fifthWrongResult.ok) {
  assert.equal(fifthWrongResult.nextAttempts, 5);
  assert.match(fifthWrongResult.error, /Maximum attempts reached/i);
}

const validResult = await checkLoginOtpVerification({
  verification: {
    otpHash: validHash,
    expiresAt: new Date(now.getTime() + 60_000),
    attempts: 1,
  },
  otp: "654321",
  now,
});
assert.deepEqual(validResult, { ok: true });

// 4. Email normalization + post-lockout cooldown guard
assert.equal(normalizeLoginEmail("  Admin@TUP.EDU.PH "), "admin@tup.edu.ph");
assert.equal(normalizeLoginEmail("   "), "");

assert.equal(
  decideLoginChallengeAction({
    cooldownActive: false,
    isResend: false,
    hasRecent: false,
    expired: false,
    attempts: 0,
  }),
  "send",
);
assert.equal(
  decideLoginChallengeAction({
    cooldownActive: true,
    isResend: true,
    hasRecent: true,
    expired: false,
    attempts: 0,
  }),
  "rate_limit",
);
assert.equal(
  decideLoginChallengeAction({
    cooldownActive: true,
    isResend: false,
    hasRecent: true,
    expired: false,
    attempts: 5,
  }),
  "rate_limit",
);
assert.equal(
  decideLoginChallengeAction({
    cooldownActive: true,
    isResend: false,
    hasRecent: true,
    expired: false,
    attempts: 2,
  }),
  "reuse",
);
assert.equal(
  decideLoginChallengeAction({
    cooldownActive: true,
    isResend: false,
    hasRecent: true,
    expired: true,
    attempts: 0,
  }),
  "send",
);

console.log("Login 2FA unit tests passed!");
