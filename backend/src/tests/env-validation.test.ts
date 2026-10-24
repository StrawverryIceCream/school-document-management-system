import assert from "node:assert";

export function validateRequiredEnv(env: Record<string, string | undefined>): {
  valid: boolean;
  missing: string[];
} {
  const required = ["DATABASE_URL", "SESSION_SECRET", "CLIENT_ORIGIN"];
  const missing = required.filter((key) => !env[key]?.trim());
  return { valid: missing.length === 0, missing };
}

console.log("Running environment variable validation tests...");

const missingCheck = validateRequiredEnv({ DATABASE_URL: "postgres://..." });
assert.strictEqual(missingCheck.valid, false);
assert.deepStrictEqual(missingCheck.missing, [
  "SESSION_SECRET",
  "CLIENT_ORIGIN",
]);

const validCheck = validateRequiredEnv({
  DATABASE_URL: "postgres://...",
  SESSION_SECRET: "my-secret",
  CLIENT_ORIGIN: "http://localhost:5173",
});
assert.strictEqual(validCheck.valid, true);
assert.strictEqual(validCheck.missing.length, 0);

console.log("All env validation tests passed!");
