import assert from "node:assert";
import {
  DEFAULT_ACADEMIC_TERM,
  needsAcademicTermVerification,
  buildApprovedStandingPatch,
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

console.log("Academic term verification domain tests passed successfully!");
