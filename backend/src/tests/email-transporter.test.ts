import assert from "node:assert";

let createCount = 0;
function getTransporter() {
  createCount++;
  return { sendMail: async () => ({}) };
}

// Module-level singleton pattern
let cachedTransporter: ReturnType<typeof getTransporter> | null = null;
export function getSharedTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = getTransporter();
  }
  return cachedTransporter;
}

console.log("Running email transporter singleton test...");

getSharedTransporter();
getSharedTransporter();
getSharedTransporter();

assert.strictEqual(
  createCount,
  1,
  "Transporter should only be created once and reused",
);
console.log("Transporter singleton test passed!");
