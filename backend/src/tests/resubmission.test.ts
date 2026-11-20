import assert from "node:assert/strict";
import {
  MAX_MISSED_REQUIREMENTS,
  sanitizeMissedRequirements,
  validateResubmissionPayload,
} from "../lib/resubmission.js";

console.log("Running missed requirements resubmission tests...");

// 1. sanitizeMissedRequirements rejects empty, over-limit, missing label, or invalid type
assert.equal(sanitizeMissedRequirements([]).valid, false);
assert.equal(sanitizeMissedRequirements(null).valid, false);
assert.equal(
  sanitizeMissedRequirements([
    { label: "   ", type: "file", required: true },
  ]).valid,
  false,
);
assert.equal(
  sanitizeMissedRequirements([
    { label: "Birth Certificate", type: "date", required: true },
  ]).valid,
  false,
);
assert.equal(
  sanitizeMissedRequirements(
    Array.from({ length: MAX_MISSED_REQUIREMENTS + 1 }, (_, i) => ({
      label: `Item ${i + 1}`,
      type: "text",
      required: true,
    })),
  ).valid,
  false,
);

// 2. sanitizeMissedRequirements deduplicates keys and preserves order
const sanitized = sanitizeMissedRequirements([
  { label: "Clear Student ID", type: "file", required: true },
  { label: "Clear Student ID", type: "text", required: false },
  { label: "Additional Remarks", type: "textarea", required: true },
]);
assert.equal(sanitized.valid, true);
if (!sanitized.valid) throw new Error("Expected valid missed requirements");

assert.equal(sanitized.items.length, 3);
assert.equal(sanitized.items[0].key, "clear-student-id");
assert.equal(sanitized.items[1].key, "clear-student-id-2");
assert.equal(sanitized.items[1].required, false);
assert.equal(sanitized.items[2].type, "textarea");

// 3. validateResubmissionPayload checks required files and required text while allowing optional items
assert.equal(
  validateResubmissionPayload(
    sanitized.items,
    { "additional-remarks": "Corrected spelling" },
    new Set(),
  ).valid,
  false,
);

assert.equal(
  validateResubmissionPayload(
    sanitized.items,
    { "additional-remarks": "   " },
    new Set(["clear-student-id"]),
  ).valid,
  false,
);

assert.equal(
  validateResubmissionPayload(
    sanitized.items,
    { "additional-remarks": "Corrected spelling" },
    new Set(["clear-student-id"]),
  ).valid,
  true,
);

console.log("All missed requirements resubmission tests passed!");
