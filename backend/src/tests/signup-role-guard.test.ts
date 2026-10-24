import assert from "node:assert";

// Unit test verifying role validation rules for public registration
const ALLOWED_PUBLIC_ROLES = ["student", "teacher"] as const;

export function validateSignupRole(role: unknown): { valid: boolean; error?: string } {
  const USER_ROLES = ["admin", "staff", "teacher", "student"];
  if (typeof role !== "string" || !USER_ROLES.includes(role)) {
    return { valid: false, error: "A valid role is required" };
  }
  if (!ALLOWED_PUBLIC_ROLES.includes(role as any)) {
    return {
      valid: false,
      error: "Self-registration is only permitted for students and faculty",
    };
  }
  return { valid: true };
}

console.log("Running public signup role guard tests...");

// Rejects admin and staff
const adminCheck = validateSignupRole("admin");
assert.strictEqual(adminCheck.valid, false);
assert.strictEqual(
  adminCheck.error,
  "Self-registration is only permitted for students and faculty",
);

const staffCheck = validateSignupRole("staff");
assert.strictEqual(staffCheck.valid, false);
assert.strictEqual(
  staffCheck.error,
  "Self-registration is only permitted for students and faculty",
);

// Allows student and teacher
const studentCheck = validateSignupRole("student");
assert.strictEqual(studentCheck.valid, true);

const teacherCheck = validateSignupRole("teacher");
assert.strictEqual(teacherCheck.valid, true);

// Rejects invalid inputs
const invalidCheck = validateSignupRole("superadmin");
assert.strictEqual(invalidCheck.valid, false);

console.log("All signup role guard tests passed!");
