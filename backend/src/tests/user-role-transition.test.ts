import assert from "node:assert";
import {
  sanitizeRoleTransition,
  type RoleTransitionUserRecord,
} from "../lib/role-transition.js";

function runTests() {
  console.log("Running user role transition sanitization tests...");

  const studentUser: RoleTransitionUserRecord = {
    id: "user-1",
    role: "student",
    studentId: "TUPM-21-0001",
    collegeId: "col-1",
    courseId: "course-1",
    section: "3A",
    yearLevel: 3,
    studentStatus: "regular",
    department: null,
    office: null,
    officeId: null,
  };

  // Student -> Staff transition
  const staffUpdate = sanitizeRoleTransition(studentUser, {
    role: "staff",
    officeId: "office-our-uuid",
  });

  assert.strictEqual(staffUpdate.role, "staff");
  assert.strictEqual(staffUpdate.officeId, "office-our-uuid");
  assert.strictEqual(staffUpdate.studentId, null);
  assert.strictEqual(staffUpdate.collegeId, null);
  assert.strictEqual(staffUpdate.courseId, null);
  assert.strictEqual(staffUpdate.department, null);

  // Staff -> Teacher transition
  const staffUser: RoleTransitionUserRecord = {
    ...studentUser,
    role: "staff",
    officeId: "office-our-uuid",
    office: null,
    studentId: null,
    collegeId: null,
    courseId: null,
    section: null,
    yearLevel: null,
    studentStatus: null,
  };

  const teacherUpdate = sanitizeRoleTransition(staffUser, {
    role: "teacher",
    department: "Computer Studies",
  });

  assert.strictEqual(teacherUpdate.role, "teacher");
  assert.strictEqual(teacherUpdate.department, "Computer Studies");
  assert.strictEqual(teacherUpdate.officeId, null);
  assert.strictEqual(teacherUpdate.office, null);

  // Teacher -> Student transition requires courseId
  const teacherUser: RoleTransitionUserRecord = {
    ...studentUser,
    role: "teacher",
    department: "Mathematics",
    studentId: null,
    collegeId: null,
    courseId: null,
    section: null,
    yearLevel: null,
    studentStatus: null,
  };

  assert.throws(
    () =>
      sanitizeRoleTransition(teacherUser, {
        role: "student",
        studentId: "TUPM-22-9999",
      }),
    /degree program|course/i,
  );

  const studentAgain = sanitizeRoleTransition(teacherUser, {
    role: "student",
    studentId: "TUPM-22-9999",
    collegeId: "col-science",
    courseId: "course-bsmath",
    yearLevel: 2,
    section: "BSMATH-2A",
    studentStatus: "regular",
  });

  assert.strictEqual(studentAgain.role, "student");
  assert.strictEqual(studentAgain.studentId, "TUPM-22-9999");
  assert.strictEqual(studentAgain.collegeId, "col-science");
  assert.strictEqual(studentAgain.courseId, "course-bsmath");
  assert.strictEqual(studentAgain.yearLevel, 2);
  assert.strictEqual(studentAgain.section, "BSMATH-2A");
  assert.strictEqual(studentAgain.department, null);

  // Student section cannot be set when courseId is missing
  assert.throws(
    () =>
      sanitizeRoleTransition(
        { ...studentUser, courseId: null, section: null },
        { section: "BSCS-3B" },
      ),
    /degree program|course/i,
  );

  // Alumni student transition must clear yearLevel and section
  const alumniStudent = sanitizeRoleTransition(studentUser, {
    studentStatus: "alumni",
    yearLevel: 4,
    section: "BSCS-4A",
  });
  assert.strictEqual(alumniStudent.studentStatus, "alumni");
  assert.strictEqual(alumniStudent.yearLevel, null);
  assert.strictEqual(alumniStudent.section, null);

  // Student -> Admin transition (must clear yearLevel, section, studentStatus to satisfy DB check constraints)
  const adminUpdate = sanitizeRoleTransition(studentUser, {
    role: "admin",
  });

  assert.strictEqual(adminUpdate.role, "admin");
  assert.strictEqual(adminUpdate.yearLevel, null);
  assert.strictEqual(adminUpdate.section, null);
  assert.strictEqual(adminUpdate.studentStatus, null);
  assert.strictEqual(adminUpdate.courseId, null);
  assert.strictEqual(adminUpdate.studentId, null);

  // Admin suspension / name edit preserves existing admin officeId and department
  const existingAdmin: RoleTransitionUserRecord = {
    ...studentUser,
    role: "admin",
    studentId: null,
    collegeId: null,
    courseId: null,
    section: null,
    yearLevel: null,
    studentStatus: null,
    department: "Academic Affairs",
    office: "registrar",
    officeId: "office-our-uuid",
  };
  const adminSuspendUpdate = sanitizeRoleTransition(existingAdmin, {
    isActive: false,
  });
  assert.strictEqual(adminSuspendUpdate.isActive, false);
  assert.strictEqual(adminSuspendUpdate.officeId, "office-our-uuid");
  assert.strictEqual(adminSuspendUpdate.office, "registrar");
  assert.strictEqual(adminSuspendUpdate.department, "Academic Affairs");

  // Cannot clear courseId on an existing student with a course/section
  assert.throws(
    () => sanitizeRoleTransition(studentUser, { courseId: null }),
    /degree program|course/i,
  );

  // Rejects invalid studentStatus and malformed studentId values
  assert.throws(
    () => sanitizeRoleTransition(studentUser, { studentStatus: "invalid" }),
    /status/i,
  );
  assert.throws(
    () => sanitizeRoleTransition(studentUser, { studentId: "TUPM-" }),
    /TUPM-/i,
  );

  console.log("All role transition sanitization tests passed!");
}

runTests();
