import assert from "node:assert";

type RequestStatus =
  | "pending"
  | "awaiting_payment"
  | "processing"
  | "on_hold"
  | "ready"
  | "claimed"
  | "rejected"
  | "cancelled";

export const STATUS_TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  pending: ["processing", "rejected", "cancelled"],
  awaiting_payment: ["processing", "rejected", "cancelled"],
  processing: ["ready", "on_hold", "rejected", "cancelled"],
  on_hold: ["processing", "rejected", "cancelled"],
  ready: ["claimed", "cancelled"],
  claimed: [],
  rejected: [],
  cancelled: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

console.log("Running request status transition validation tests...");

// Rejected is allowed from pending, processing, on_hold
assert.strictEqual(canTransition("pending", "rejected"), true);
assert.strictEqual(canTransition("processing", "rejected"), true);
assert.strictEqual(canTransition("on_hold", "rejected"), true);
assert.strictEqual(canTransition("ready", "rejected"), false);

// Cancelled is allowed from pending, processing, on_hold, ready
assert.strictEqual(canTransition("pending", "cancelled"), true);
assert.strictEqual(canTransition("processing", "cancelled"), true);
assert.strictEqual(canTransition("on_hold", "cancelled"), true);
assert.strictEqual(canTransition("ready", "cancelled"), true);

// Claimed is only allowed from ready
assert.strictEqual(canTransition("ready", "claimed"), true);
assert.strictEqual(canTransition("pending", "claimed"), false);

// Terminal states have no transitions
assert.strictEqual(canTransition("claimed", "processing"), false);
assert.strictEqual(canTransition("rejected", "ready"), false);
assert.strictEqual(canTransition("cancelled", "ready"), false);

console.log("All status transition tests passed!");
