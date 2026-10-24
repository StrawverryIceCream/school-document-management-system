import assert from "node:assert";

const ALL_ACTION_STATUSES = [
  "processing",
  "on_hold",
  "ready",
  "claimed",
  "rejected",
  "cancelled",
] as const;

function isAllowedReviewAction(status: string): boolean {
  return (ALL_ACTION_STATUSES as readonly string[]).includes(status);
}

console.log("Running review action constants tests...");
assert.strictEqual(isAllowedReviewAction("rejected"), true);
assert.strictEqual(isAllowedReviewAction("cancelled"), true);
assert.strictEqual(isAllowedReviewAction("claimed"), true);
assert.strictEqual(isAllowedReviewAction("invalid_status"), false);
console.log("Review action constants tests passed!");
