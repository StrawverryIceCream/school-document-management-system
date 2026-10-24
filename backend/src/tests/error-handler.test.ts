import assert from "node:assert";

export function formatErrorResponse(
  err: unknown,
  isProduction: boolean,
): { status: number; body: { error: string; details?: string } } {
  const message = err instanceof Error ? err.message : "Internal server error";
  return {
    status: 500,
    body: isProduction
      ? { error: "Internal server error" }
      : { error: "Internal server error", details: message },
  };
}

console.log("Running error handler formatting tests...");

const prodRes = formatErrorResponse(
  new Error("Database connection leak at /src/db/db.ts:7"),
  true,
);
assert.strictEqual(prodRes.status, 500);
assert.strictEqual(prodRes.body.error, "Internal server error");
assert.strictEqual(
  prodRes.body.details,
  undefined,
  "Production response must NOT leak internal error message",
);

const devRes = formatErrorResponse(new Error("Local debug detail"), false);
assert.strictEqual(devRes.body.details, "Local debug detail");

console.log("All error handler formatting tests passed!");
