import assert from "node:assert";

export const STEP_LABELS = [
  "Filed",
  "Assessed",
  "Signatures",
  "Released",
] as const;

export type StepState = {
  isCompleted: boolean;
  isCurrent: boolean;
  label: string;
};

export function computeStepStates(status: string, completedSteps: number): StepState[] {
  return STEP_LABELS.map((label, index) => {
    const isCompleted = index < completedSteps;
    const isCurrent =
      index === completedSteps - 1 && status !== "ready" && status !== "claimed";
    return {
      isCompleted,
      isCurrent,
      label,
    };
  });
}

export function formatTimelineReference(referenceNumber?: string | null, id?: string): string {
  if (referenceNumber && referenceNumber.trim()) {
    return referenceNumber.trim();
  }
  return id ? `#${id.slice(0, 8)}` : "#UNKNOWN";
}

console.log("Running timeline stepper helper tests...");

// Test 4 steps
assert.strictEqual(STEP_LABELS.length, 4);
assert.deepStrictEqual([...STEP_LABELS], ["Filed", "Assessed", "Signatures", "Released"]);

// Test pending status (completedSteps = 1)
const pendingSteps = computeStepStates("pending", 1);
assert.strictEqual(pendingSteps[0].isCompleted, true);
assert.strictEqual(pendingSteps[0].isCurrent, true);
assert.strictEqual(pendingSteps[1].isCompleted, false);
assert.strictEqual(pendingSteps[1].isCurrent, false);

// Test processing status (completedSteps = 2)
const processingSteps = computeStepStates("processing", 2);
assert.strictEqual(processingSteps[0].isCompleted, true);
assert.strictEqual(processingSteps[0].isCurrent, false);
assert.strictEqual(processingSteps[1].isCompleted, true);
assert.strictEqual(processingSteps[1].isCurrent, true);
assert.strictEqual(processingSteps[2].isCompleted, false);

// Test ready status (completedSteps = 4)
const readySteps = computeStepStates("ready", 4);
assert.strictEqual(readySteps.every((s) => s.isCompleted), true);
assert.strictEqual(readySteps.some((s) => s.isCurrent), false);

// Test reference formatting
assert.strictEqual(formatTimelineReference("REQ-2026-000088", "12345678-abcd"), "REQ-2026-000088");
assert.strictEqual(formatTimelineReference("", "12345678-abcd"), "#12345678");
assert.strictEqual(formatTimelineReference(null, "abcdef01-2345"), "#abcdef01");

console.log("Timeline stepper helper tests passed!");
