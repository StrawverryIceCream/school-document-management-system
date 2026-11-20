import assert from "node:assert/strict";
import { isTwoFactorChallenge } from "../api/auth.ts";

console.log("Running frontend login 2FA unit tests...");

assert.equal(
  isTwoFactorChallenge({
    requiresTwoFactor: true,
    email: "admin@tup.edu.ph",
    message: "Verification code sent to your email",
  }),
  true,
);

assert.equal(
  isTwoFactorChallenge({
    requiresTwoFactor: false,
    email: "admin@tup.edu.ph",
  }),
  false,
);

assert.equal(
  isTwoFactorChallenge({
    id: "user-1",
    email: "admin@tup.edu.ph",
    fullName: "Admin User",
    role: "admin",
  }),
  false,
);

assert.equal(isTwoFactorChallenge(null), false);
assert.equal(isTwoFactorChallenge(undefined), false);

console.log("Frontend login 2FA tests passed!");
