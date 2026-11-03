import assert from "node:assert";

// Unit test verifying OTP registration logic, whitespace normalization,
// rate-limiting cooldown math, and delivery failure resilience.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log("Running signup OTP trace & normalization tests...");

// 1. Email format and whitespace normalization
function normalizeEmail(rawEmail: unknown): { valid: boolean; normalized?: string; error?: string } {
  if (typeof rawEmail !== "string" || !rawEmail.trim() || !EMAIL_REGEX.test(rawEmail.trim())) {
    return { valid: false, error: "A valid email address is required" };
  }
  return { valid: true, normalized: rawEmail.trim().toLowerCase() };
}

assert.strictEqual(
  normalizeEmail("  student@university.edu.ph  ").valid,
  true,
  "Should validate email with leading/trailing whitespace",
);
assert.strictEqual(
  normalizeEmail("  student@university.edu.ph  ").normalized,
  "student@university.edu.ph",
  "Should normalize to lowercase trimmed email",
);
assert.strictEqual(
  normalizeEmail("Teacher.Name@Domain.EDU").normalized,
  "teacher.name@domain.edu",
  "Should normalize uppercase domains and user parts",
);
assert.strictEqual(
  normalizeEmail("invalid-email").valid,
  false,
  "Should reject invalid email format",
);
assert.strictEqual(
  normalizeEmail("   ").valid,
  false,
  "Should reject whitespace-only email",
);

// 2. Cooldown calculation logic with Date instance and ISO string compatibility
function calculateCooldown(createdAt: Date | string, now: Date = new Date()): { active: boolean; waitSeconds: number } {
  const createdMs = new Date(createdAt).getTime();
  const diffMs = now.getTime() - createdMs;
  if (diffMs < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
    return { active: true, waitSeconds };
  }
  return { active: false, waitSeconds: 0 };
}

const now = new Date("2026-11-03T12:00:00Z");
// Attempt 15 seconds ago -> 45s wait
const recent15s = new Date(now.getTime() - 15 * 1000);
const res1 = calculateCooldown(recent15s, now);
assert.strictEqual(res1.active, true);
assert.strictEqual(res1.waitSeconds, 45);

// Test with ISO string (as might be returned by serialized JSON)
const resIso = calculateCooldown(recent15s.toISOString(), now);
assert.strictEqual(resIso.active, true);
assert.strictEqual(resIso.waitSeconds, 45);

// Attempt 65 seconds ago -> cooldown expired
const past65s = new Date(now.getTime() - 65 * 1000);
const res2 = calculateCooldown(past65s, now);
assert.strictEqual(res2.active, false);
assert.strictEqual(res2.waitSeconds, 0);

// 3. Atomicity simulation: Ensure failed email dispatch does not orphan verification records
interface MockVerificationRecord {
  email: string;
  otp: string;
  createdAt: Date;
}

class MockVerificationStore {
  records: MockVerificationRecord[] = [];

  async sendOtp(
    email: string,
    otp: string,
    mockEmailSender: (email: string, otp: string) => Promise<void>,
  ): Promise<{ success: boolean; error?: string }> {
    // Check cooldown
    const recent = this.records.find((r) => r.email === email);
    if (recent) {
      const cooldown = calculateCooldown(recent.createdAt);
      if (cooldown.active) {
        return { success: false, error: `Please wait ${cooldown.waitSeconds} seconds before requesting a new code` };
      }
    }

    // Try sending email first before committing to store
    try {
      await mockEmailSender(email, otp);
    } catch (err) {
      // Failed delivery: do not save record, preventing false cooldown lockout!
      return { success: false, error: "Failed to deliver verification email. Please check your email address or try again." };
    }

    // Email delivery succeeded: commit record
    this.records = this.records.filter((r) => r.email !== email);
    this.records.push({ email, otp, createdAt: new Date() });
    return { success: true };
  }
}

async function testResilience() {
  const store = new MockVerificationStore();
  const testEmail = "applicant@test.edu";

  // Case A: Email sender throws an error (e.g. SMTP connection timeout)
  const failResult = await store.sendOtp(testEmail, "123456", async () => {
    throw new Error("SMTP connect ETIMEDOUT");
  });

  assert.strictEqual(failResult.success, false);
  assert.strictEqual(failResult.error, "Failed to deliver verification email. Please check your email address or try again.");
  assert.strictEqual(store.records.length, 0, "No verification record should exist after delivery failure");

  // Immediate retry should NOT hit 429 rate limit because no record was saved!
  const retryResult = await store.sendOtp(testEmail, "654321", async () => {
    // Delivery succeeds on retry
  });

  assert.strictEqual(retryResult.success, true, "Retry should succeed immediately without cooldown lockout");
  assert.strictEqual(store.records.length, 1, "Verification record committed only after delivery succeeds");

  // Subsequent immediate request within 60s should now properly be rate-limited
  const rateLimitedResult = await store.sendOtp(testEmail, "999999", async () => {});
  assert.strictEqual(rateLimitedResult.success, false);
  assert.ok(rateLimitedResult.error?.includes("Please wait"), "Should be rate limited after successful delivery");
}

await testResilience();
console.log("All signup OTP trace & normalization tests passed!");

