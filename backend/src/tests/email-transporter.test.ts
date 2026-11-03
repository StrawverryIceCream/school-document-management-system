import assert from "node:assert";
import { parseSender } from "../services/email.service.js";

console.log("Running email sender format and parse tests...");

// 1. Full sender with display name and angle brackets
const parsed1 = parseSender("ARCH Support <itsmealyson37@gmail.com>");
assert.strictEqual(parsed1.name, "ARCH Support");
assert.strictEqual(parsed1.email, "itsmealyson37@gmail.com");

// 2. Bare email address without angle brackets
const parsed2 = parseSender("itsmealyson37@gmail.com");
assert.strictEqual(parsed2.name, "ARCH Support");
assert.strictEqual(parsed2.email, "itsmealyson37@gmail.com");

// 3. Sender with quoted display name
const parsed3 = parseSender('"Office of the Registrar" <registrar@arch.edu>');
assert.strictEqual(parsed3.name, "Office of the Registrar");
assert.strictEqual(parsed3.email, "registrar@arch.edu");

console.log("Email sender format tests passed successfully!");
