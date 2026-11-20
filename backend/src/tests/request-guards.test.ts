import assert from "node:assert/strict";
import {
  isSelfRequestAction,
  isUserEligibleForDocument,
  validateRequestAssignmentActors,
} from "../lib/request-guards.js";

console.log("Running request self-processing & eligibility guard tests...");

// 1. isSelfRequestAction compares requester and actor IDs
assert.equal(isSelfRequestAction("user-1", "user-1"), true);
assert.equal(isSelfRequestAction("user-1", "user-2"), false);

// 2. validateRequestAssignmentActors blocks requester acting on own request (403 + audit)
assert.deepEqual(
  validateRequestAssignmentActors("user-1", "user-1", "user-1"),
  {
    allowed: false,
    status: 403,
    error:
      "You can't assign or unassign your own request. Another staff member or admin must handle it.",
    auditAction: "request.self_assignment_blocked",
  },
);
assert.deepEqual(
  validateRequestAssignmentActors("user-1", "user-1", "user-2"),
  {
    allowed: false,
    status: 403,
    error:
      "You can't assign or unassign your own request. Another staff member or admin must handle it.",
    auditAction: "request.self_assignment_blocked",
  },
);
assert.deepEqual(validateRequestAssignmentActors("user-1", "user-1", null), {
  allowed: false,
  status: 403,
  error:
    "You can't assign or unassign your own request. Another staff member or admin must handle it.",
  auditAction: "request.self_assignment_blocked",
});

// Other actor cannot assign request back to the requester (400)
assert.deepEqual(
  validateRequestAssignmentActors("user-1", "staff-2", "user-1"),
  {
    allowed: false,
    status: 400,
    error: "A request can't be assigned to the person who made it",
  },
);

// Other actor can assign to colleague or unassign
assert.deepEqual(
  validateRequestAssignmentActors("user-1", "staff-2", "staff-3"),
  { allowed: true },
);
assert.deepEqual(validateRequestAssignmentActors("user-1", "staff-2", null), {
  allowed: true,
});

// 3. isUserEligibleForDocument mirrors document category & student status rules
assert.deepEqual(
  isUserEligibleForDocument(
    { isActive: false, allowedCategories: ["student"] },
    { role: "student", studentStatus: "regular" },
  ),
  {
    eligible: false,
    status: 400,
    error: "This document type is not available for requests",
  },
);

assert.deepEqual(
  isUserEligibleForDocument(
    { isActive: true, allowedCategories: ["student"] },
    { role: "admin" },
  ),
  { eligible: true },
);

assert.deepEqual(
  isUserEligibleForDocument(
    { isActive: true, allowedCategories: ["student"] },
    { role: "staff" },
  ),
  {
    eligible: false,
    status: 403,
    error: "You are not eligible to request this document type",
  },
);

assert.deepEqual(
  isUserEligibleForDocument(
    { isActive: true, allowedCategories: ["teacher", "staff"] },
    { role: "staff" },
  ),
  { eligible: true },
);

assert.deepEqual(
  isUserEligibleForDocument(
    {
      isActive: true,
      allowedCategories: ["student"],
      allowedStudentStatuses: ["graduating", "alumni"],
    },
    { role: "student", studentStatus: "regular" },
  ),
  {
    eligible: false,
    status: 403,
    error: "Your student status is not eligible for this document type",
  },
);

assert.deepEqual(
  isUserEligibleForDocument(
    {
      isActive: true,
      allowedCategories: ["student"],
      allowedStudentStatuses: ["graduating", "alumni"],
    },
    { role: "student", studentStatus: "alumni" },
  ),
  { eligible: true },
);

console.log("All request guard tests passed!");
