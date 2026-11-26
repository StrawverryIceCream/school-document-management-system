import assert from "node:assert";
import {
  parseSender,
  sendPaymentProofUploadedEmail,
  sendPaymentVerifiedEmail,
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
    "e_wallet",
    "150.00",
  );
  assert.deepStrictEqual(result, { delivered: false, devMode: true });

  const uploadLog = loggedEmail.join("\n");
  assert.ok(uploadLog.includes("To: student@gmail.com"));
  assert.ok(uploadLog.includes("Payment proof received"));
  assert.ok(uploadLog.includes("REQ-2026-000123"));
  assert.ok(uploadLog.includes("Mode of payment: E-Wallet"));
  assert.ok(uploadLog.includes("Amount due: ₱150.00"));
  assert.ok(uploadLog.includes("pending staff verification"));
  assert.ok(uploadLog.includes("payment has not yet been verified"));

  loggedEmail.length = 0;

  const verifiedResult = await sendPaymentVerifiedEmail(
    "student@gmail.com",
    "Juan Student",
    "Transcript of Records",
    "REQ-2026-000123",
    "e_wallet",
    "150.00",
    "RCP-2026-ABCD1234",
  );
  assert.deepStrictEqual(verifiedResult, { delivered: false, devMode: true });

  const verifiedLog = loggedEmail.join("\n");
  assert.ok(verifiedLog.includes("To: student@gmail.com"));
  assert.ok(verifiedLog.includes("Payment acknowledged"));
  assert.ok(verifiedLog.includes("REQ-2026-000123"));
  assert.ok(verifiedLog.includes("Mode of Payment: E-Wallet"));
  assert.ok(verifiedLog.includes("Amount: ₱150.00"));
  assert.ok(verifiedLog.includes("Official Receipt: RCP-2026-ABCD1234"));
} finally {
  console.log = originalConsoleLog;
  if (previousBrevoApiKey === undefined) {
    delete process.env.BREVO_API_KEY;
  } else {
    process.env.BREVO_API_KEY = previousBrevoApiKey;
  }
}

console.log("Email sender format tests passed successfully!");
