import assert from "node:assert";
import {
  DEFAULT_ACADEMIC_TERM,
  buildApprovedStandingPatch,
  canUserReviewAccountUpdates,
  extractCourseCodeFromSection,
  isActiveAdminRecipient,
  needsAcademicTermVerification,
  validateRequestedStanding,
} from "../lib/term-standing.js";

console.log("Running academic term verification domain tests...");

// 1. Non-students are never gated
assert.strictEqual(
  needsAcademicTermVerification({ role: "admin", verifiedAcademicTerm: null }, "AY 2026–2027"),
  false,
  "Admin should never need verification",
);
assert.strictEqual(
  needsAcademicTermVerification({ role: "staff", verifiedAcademicTerm: null }, "AY 2026–2027"),
  false,
  "Staff should never need verification",
);
assert.strictEqual(
  needsAcademicTermVerification({ role: "teacher", verifiedAcademicTerm: null }, "AY 2026–2027"),
  false,
  "Teacher should never need verification",
);

// 2. Alumni students are exempt regardless of term
assert.strictEqual(
  needsAcademicTermVerification(
    { role: "student", studentStatus: "alumni", verifiedAcademicTerm: null },
    "AY 2026–2027",
  ),
  false,
  "Alumni students should be exempt even if verifiedAcademicTerm is null",
);
assert.strictEqual(
  needsAcademicTermVerification(
    { role: "student", studentStatus: "alumni", verifiedAcademicTerm: "AY 2025–2026" },
    "AY 2026–2027",
  ),
  false,
  "Alumni students should be exempt when term advances",
);

// 3. Returning non-alumni students with NULL verified term are gated
assert.strictEqual(
  needsAcademicTermVerification(
    { role: "student", studentStatus: "regular", verifiedAcademicTerm: null },
    "AY 2026–2027",
  ),
  true,
  "Enrolled student with null verified term must be gated",
);
assert.strictEqual(
  needsAcademicTermVerification(
    { role: "student", studentStatus: "irregular", verifiedAcademicTerm: undefined },
    "AY 2026–2027",
  ),
  true,
  "Enrolled student with undefined verified term must be gated",
);

// 4. Term change re-gates returning students
assert.strictEqual(
  needsAcademicTermVerification(
    { role: "student", studentStatus: "regular", verifiedAcademicTerm: "AY 2025–2026" },
    "AY 2026–2027",
  ),
  true,
  "Student verified for past term must be re-gated when active term advances",
);

// 5. Matching active term passes
assert.strictEqual(
  needsAcademicTermVerification(
    { role: "student", studentStatus: "regular", verifiedAcademicTerm: "AY 2026–2027" },
    "AY 2026–2027",
  ),
  false,
  "Student with matching active term should not be gated",
);

// 6. Approved standing builder: Non-alumni retains yearLevel and section
const regularPatch = buildApprovedStandingPatch({
  academicTerm: "AY 2026–2027",
  requestedStudentStatus: "regular",
  requestedYearLevel: 3,
  requestedSection: "BSCS-3A",
});
assert.deepStrictEqual(regularPatch, {
  yearLevel: 3,
  section: "BSCS-3A",
  studentStatus: "regular",
  verifiedAcademicTerm: "AY 2026–2027",
});

// 7. Approved standing builder: Alumni clears yearLevel and section
const alumniPatch = buildApprovedStandingPatch({
  academicTerm: "AY 2026–2027",
  requestedStudentStatus: "alumni",
  requestedYearLevel: 4,
  requestedSection: "BSCS-4B",
});
assert.deepStrictEqual(alumniPatch, {
  yearLevel: null,
  section: null,
  studentStatus: "alumni",
  verifiedAcademicTerm: "AY 2026–2027",
});

// 8. Standing validation rules
assert.strictEqual(
  validateRequestedStanding({ requestedStudentStatus: "regular", requestedYearLevel: 3 }).valid,
  true,
);
assert.strictEqual(
  validateRequestedStanding({ requestedStudentStatus: "regular", requestedYearLevel: 0 }).valid,
  false,
);
assert.strictEqual(
  validateRequestedStanding({ requestedStudentStatus: "regular", requestedYearLevel: 7 }).valid,
  false,
);
assert.strictEqual(
  validateRequestedStanding({ requestedStudentStatus: "alumni" }).valid,
  true,
);

// 9. Account update review permissions are restricted exclusively to admins
assert.strictEqual(
  canUserReviewAccountUpdates({ role: "admin" }),
  true,
  "Admin should be permitted to review account updates",
);
assert.strictEqual(
  canUserReviewAccountUpdates({ role: "staff" }),
  false,
  "Staff must not be permitted to review account updates",
);
assert.strictEqual(
  canUserReviewAccountUpdates({ role: "student" }),
  false,
  "Student must not be permitted to review account updates",
);
assert.strictEqual(
  canUserReviewAccountUpdates({ role: "teacher" }),
  false,
  "Teacher must not be permitted to review account updates",
);
assert.strictEqual(
  canUserReviewAccountUpdates(null),
  false,
  "Null user must not be permitted to review account updates",
);
assert.strictEqual(
  canUserReviewAccountUpdates(undefined),
  false,
  "Undefined user must not be permitted to review account updates",
);
assert.strictEqual(
  canUserReviewAccountUpdates({ role: null }),
  false,
  "Null role must not be permitted to review account updates",
);
assert.strictEqual(
  canUserReviewAccountUpdates({ role: "" }),
  false,
  "Empty role must not be permitted to review account updates",
);

// 10. Admin notification recipient filter selects active admins only
assert.strictEqual(
  isActiveAdminRecipient({ role: "admin", isActive: true }),
  true,
  "Active admin must be selected as notification recipient",
);
assert.strictEqual(
  isActiveAdminRecipient({ role: "admin", isActive: false }),
  false,
  "Inactive admin must not receive admin notifications",
);
assert.strictEqual(
  isActiveAdminRecipient({ role: "admin", isActive: null }),
  false,
  "Admin with null isActive must not receive admin notifications",
);
assert.strictEqual(
  isActiveAdminRecipient({ role: "admin" }),
  false,
  "Admin missing isActive must not receive admin notifications",
);
assert.strictEqual(
  isActiveAdminRecipient({ role: "staff", isActive: true }),
  false,
  "Active staff must not receive admin-only notifications",
);
assert.strictEqual(
  isActiveAdminRecipient({ role: "student", isActive: true }),
  false,
  "Active student must not receive admin-only notifications",
);
assert.strictEqual(
  isActiveAdminRecipient({ role: "teacher", isActive: true }),
  false,
  "Active teacher must not receive admin-only notifications",
);
assert.strictEqual(
  isActiveAdminRecipient(null),
  false,
  "Null user must not receive admin notifications",
);
assert.strictEqual(
  isActiveAdminRecipient(undefined),
  false,
  "Undefined user must not receive admin notifications",
);

const mixedCandidates = [
  { id: "admin-1", role: "admin", isActive: true },
  { id: "admin-inactive", role: "admin", isActive: false },
  { id: "registrar-staff", role: "staff", isActive: true },
  { id: "student-1", role: "student", isActive: true },
  { id: "admin-2", role: "admin", isActive: true },
];
assert.deepStrictEqual(
  mixedCandidates.filter(isActiveAdminRecipient).map((u) => u.id),
  ["admin-1", "admin-2"],
  "Only active admins should be retained as notification recipients",
);

// 11. Course code inference from student section for missing courseId backfill
assert.strictEqual(extractCourseCodeFromSection("BSCS-3B"), "BSCS");
assert.strictEqual(extractCourseCodeFromSection("  bsit-1a  "), "BSIT");
assert.strictEqual(extractCourseCodeFromSection("BSEE 2C"), "BSEE");
assert.strictEqual(extractCourseCodeFromSection("BSCE3A"), "BSCE");
assert.strictEqual(extractCourseCodeFromSection("3B"), null);
assert.strictEqual(extractCourseCodeFromSection(""), null);
assert.strictEqual(extractCourseCodeFromSection(null), null);
assert.strictEqual(extractCourseCodeFromSection(undefined), null);

console.log("Academic term verification domain tests passed successfully!");
