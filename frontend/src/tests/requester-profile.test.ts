import assert from "node:assert/strict";
import {
  getInitialRequiredFieldValue,
  getRequesterProfileSummary,
  getRoleIdRequirementLabel,
} from "../lib/profile/requester";

// 1. Teacher profile shows faculty fields, never student labels
const teacher = {
  id: "t-1",
  fullName: "Prof. Elena Reyes",
  email: "elena.reyes@tup.edu.ph",
  role: "teacher" as const,
  department: "College of Science",
  contactNumber: "+63 917 555 0101",
};

const teacherSummary = getRequesterProfileSummary(teacher);
assert.equal(teacherSummary.badgeLabel, "Teacher");
assert.equal(teacherSummary.tiles[0].label, "Faculty Name");
assert.equal(teacherSummary.tiles[0].value, "Prof. Elena Reyes");
assert.equal(teacherSummary.tiles[2].label, "Department");
assert.equal(teacherSummary.tiles[2].value, "College of Science");
assert.equal(teacherSummary.primaryIdentifier.label, "Department");
assert.equal(teacherSummary.primaryIdentifier.value, "College of Science");
assert.equal(teacherSummary.primaryIdentifier.hasValue, true);
assert.equal(
  teacherSummary.idRequirementLabel,
  "University Faculty / Employee ID",
);

// 2. Teacher dynamic field pre-fill does not cross-contaminate student fields
assert.equal(
  getInitialRequiredFieldValue(teacher, {
    key: "faculty-name",
    label: "Faculty Name",
    type: "text",
  }),
  "Prof. Elena Reyes",
);
assert.equal(
  getInitialRequiredFieldValue(teacher, {
    key: "student-id",
    label: "Student ID",
    type: "text",
  }),
  "",
);
assert.equal(
  getInitialRequiredFieldValue(teacher, {
    key: "student-course-section",
    label: "Course & Section",
    type: "text",
  }),
  "",
);
assert.equal(
  getInitialRequiredFieldValue(teacher, {
    key: "department",
    label: "Department",
    type: "text",
  }),
  "College of Science",
);

// 3. Student profile uses resolved college/course and real standing
const student = {
  id: "s-1",
  fullName: "Juan Dela Cruz",
  email: "juan@tup.edu.ph",
  role: "student" as const,
  studentId: "TUPM-23-1234",
  studentStatus: "regular" as const,
  yearLevel: 3,
  section: "BSCS-3A",
  college: { name: "College of Science" },
  course: { name: "BS Computer Science" },
};

const studentSummary = getRequesterProfileSummary(student);
assert.equal(studentSummary.badgeLabel, "Student");
assert.equal(studentSummary.tiles[1].value, "TUPM-23-1234");
assert.equal(studentSummary.tiles[2].value, "BS Computer Science");
assert.equal(studentSummary.tiles[2].detail, "College of Science");
assert.equal(studentSummary.tiles[3].value, "Year 3 • Section BSCS-3A");
assert.equal(studentSummary.primaryIdentifier.label, "TUP ID No.");
assert.equal(
  getInitialRequiredFieldValue(student, {
    key: "student-course-section",
    label: "Course & Section",
    type: "text",
  }),
  "BS Computer Science - BSCS-3A",
);

// 4. Alumni student hides year level and shows Alumni standing
const alumniSummary = getRequesterProfileSummary({
  ...student,
  studentStatus: "alumni",
  studentId: "TUPM-",
});
assert.equal(alumniSummary.tiles[1].value, "Not provided");
assert.equal(alumniSummary.tiles[3].value, "Alumni");
assert.equal(alumniSummary.primaryIdentifier.hasValue, false);

// 5. Staff and Admin roles resolve cleanly
const staffSummary = getRequesterProfileSummary({
  id: "st-1",
  fullName: "Ana Santos",
  email: "ana@tup.edu.ph",
  role: "staff",
  officeRecord: { name: "Office of the University Registrar" },
  department: "Records Division",
});
assert.equal(staffSummary.tiles[2].label, "Assigned Office");
assert.equal(staffSummary.tiles[2].value, "Office of the University Registrar");
assert.equal(staffSummary.primaryIdentifier.label, "Assigned Office");
assert.equal(getRoleIdRequirementLabel("staff"), "University Staff ID");
assert.equal(getRoleIdRequirementLabel("admin"), "Valid University ID");

console.log("requester-profile tests passed");
