import assert from "node:assert";

export function resolveAppointmentUserId(
  sessionUserId: string,
  bodyUserId?: string,
  isAdmin = false,
): string {
  if (isAdmin && bodyUserId) return bodyUserId;
  return sessionUserId;
}

console.log("Running appointment scoping tests...");

const studentBooking = resolveAppointmentUserId(
  "student-123",
  "student-999",
  false,
);
assert.strictEqual(
  studentBooking,
  "student-123",
  "Student cannot book under another user's ID",
);

const adminBooking = resolveAppointmentUserId(
  "admin-1",
  "student-999",
  true,
);
assert.strictEqual(
  adminBooking,
  "student-999",
  "Admin can book on behalf of user",
);

console.log("All appointment scoping tests passed!");
