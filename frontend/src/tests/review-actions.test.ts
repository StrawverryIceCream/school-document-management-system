import assert from "node:assert";

const ALL_ACTION_STATUSES = [
  "processing",
  "on_hold",
  "ready",
  "claimed",
  "rejected",
  "cancelled",
] as const;

const REJECTION_REASON_PRESETS = [
  "Missing required attachments or unclear document scans",
  "Unsettled academic or clearance obligations",
  "Ineligible for requested credential under current student status",
  "Discrepancy in applicant identification details",
] as const;

const CANCELLATION_REASON_PRESETS = [
  "Duplicate request submitted by requester",
  "Requester requested cancellation / withdrawal",
  "Administrative void due to scheduling or superseded record",
] as const;

function isAllowedReviewAction(status: string): boolean {
  return (ALL_ACTION_STATUSES as readonly string[]).includes(status);
}

function isExceptionAction(status: string): boolean {
  return status === "rejected" || status === "cancelled";
}

console.log("Running review action constants & presets tests...");
assert.strictEqual(isAllowedReviewAction("rejected"), true);
assert.strictEqual(isAllowedReviewAction("cancelled"), true);
assert.strictEqual(isAllowedReviewAction("claimed"), true);
assert.strictEqual(isAllowedReviewAction("invalid_status"), false);

// Test exception action grouping
assert.strictEqual(isExceptionAction("rejected"), true);
assert.strictEqual(isExceptionAction("cancelled"), true);
assert.strictEqual(isExceptionAction("ready"), false);
assert.strictEqual(isExceptionAction("processing"), false);

// Test presets validity
assert.strictEqual(REJECTION_REASON_PRESETS.length >= 3, true);
assert.strictEqual(CANCELLATION_REASON_PRESETS.length >= 3, true);
REJECTION_REASON_PRESETS.forEach((preset) => {
  assert.strictEqual(typeof preset, "string");
  assert.strictEqual(preset.trim().length > 0, true);
});
CANCELLATION_REASON_PRESETS.forEach((preset) => {
  assert.strictEqual(typeof preset, "string");
  assert.strictEqual(preset.trim().length > 0, true);
});

console.log("Review action constants & presets tests passed!");
