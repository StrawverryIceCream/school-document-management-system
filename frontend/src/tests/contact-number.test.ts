import assert from "node:assert/strict";
import { sanitizeContactNumber } from "../lib/auth/arch-registration";

assert.equal(sanitizeContactNumber("0912 345 6789"), "09123456789");
assert.equal(sanitizeContactNumber("0912-345-6789"), "09123456789");
assert.equal(sanitizeContactNumber("09123456789999"), "09123456789");
assert.equal(sanitizeContactNumber("abc0912xyz"), "0912");
assert.equal(sanitizeContactNumber(""), "");

console.log("contact-number tests passed");
