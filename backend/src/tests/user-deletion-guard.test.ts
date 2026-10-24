import assert from "node:assert";

export function validateDeletionAttempt(
  callerId: string,
  targetId: string,
): { allowed: boolean; error?: string } {
  if (callerId === targetId) {
    return {
      allowed: false,
      error: "Cannot delete your own administrator account",
    };
  }
  return { allowed: true };
}

console.log("Running user deletion guard tests...");

const selfDelete = validateDeletionAttempt("admin-1", "admin-1");
assert.strictEqual(selfDelete.allowed, false);
assert.strictEqual(
  selfDelete.error,
  "Cannot delete your own administrator account",
);

const otherDelete = validateDeletionAttempt("admin-1", "user-2");
assert.strictEqual(otherDelete.allowed, true);

console.log("All user deletion guard tests passed!");
