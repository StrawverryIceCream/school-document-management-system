import assert from "node:assert";
import {
  parseSender,
  sendPaymentProofUploadedEmail,
} from "../services/email.service.js";

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

const previousBrevoApiKey = process.env.BREVO_API_KEY;
const originalConsoleLog = console.log;
const loggedEmail: string[] = [];
delete process.env.BREVO_API_KEY;
console.log = (...args: unknown[]) => {
  loggedEmail.push(args.map(String).join(" "));
};

try {
  const result = await sendPaymentProofUploadedEmail(
    "student@gmail.com",
    "Juan Student",
    "Transcript of Records",
    "REQ-2026-000123",
  );
  assert.deepStrictEqual(result, { delivered: false, devMode: true });
} finally {
  console.log = originalConsoleLog;
  if (previousBrevoApiKey === undefined) {
    delete process.env.BREVO_API_KEY;
  } else {
    process.env.BREVO_API_KEY = previousBrevoApiKey;
  }
}

const loggedMessage = loggedEmail.join("\n");
assert.ok(loggedMessage.includes("To: student@gmail.com"));
assert.ok(loggedMessage.includes("Payment proof received"));
assert.ok(loggedMessage.includes("REQ-2026-000123"));
assert.ok(loggedMessage.includes("pending staff verification"));
assert.ok(loggedMessage.includes("payment has not yet been verified"));

console.log("Email sender format tests passed successfully!");
