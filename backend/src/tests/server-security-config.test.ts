import assert from "node:assert";

export function getCookieConfig(env: string): { httpOnly: boolean; sameSite: "lax"; secure: boolean; maxAge: number } {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

console.log("Running server security cookie configuration tests...");

const devConfig = getCookieConfig("development");
assert.strictEqual(devConfig.secure, false, "Dev should allow non-HTTPS cookie for local testing");

const prodConfig = getCookieConfig("production");
assert.strictEqual(prodConfig.secure, true, "Production MUST enforce secure cookie");

console.log("All cookie config tests passed!");
