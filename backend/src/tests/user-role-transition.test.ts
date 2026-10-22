import assert from "node:assert";

type Role = "student" | "teacher" | "admin" | "staff";

interface UserRecord {
  id: string;
  role: Role;
  studentId: string | null;
  collegeId: string | null;
  courseId: string | null;
  section: string | null;
  yearLevel: number | null;
  studentStatus: string | null;
  department: string | null;
  office: string | null;
  officeId: string | null;
}

export function sanitizeRoleTransition(
  existingUser: UserRecord,
  patch: {
    role?: Role;
    fullName?: string;
    email?: string;
    studentId?: string | null;
    collegeId?: string | null;
    courseId?: string | null;
    section?: string | null;
    yearLevel?: number | null;
    studentStatus?: string | null;
    department?: string | null;
    office?: string | null;
    officeId?: string | null;
  }
): Record<string, any> {
  const targetRole = patch.role ?? existingUser.role;
  const updateData: Record<string, any> = {};

  if (patch.fullName !== undefined) updateData.fullName = patch.fullName;
  if (patch.email !== undefined) updateData.email = patch.email;
  if (patch.role !== undefined) updateData.role = patch.role;

  if (targetRole === "staff") {
    // Staff requires office or officeId
    updateData.officeId = patch.officeId !== undefined ? patch.officeId : existingUser.officeId;
    updateData.office = patch.office !== undefined ? patch.office : existingUser.office;
    if (!updateData.officeId && !updateData.office) {
      throw new Error("Staff role requires an assigned office");
    }
    // Clean up student & teacher credentials
    updateData.studentId = null;
    updateData.collegeId = null;
    updateData.courseId = null;
    updateData.section = null;
    updateData.yearLevel = null;
    updateData.studentStatus = null;
    updateData.department = null;
  } else if (targetRole === "teacher") {
    updateData.department = patch.department !== undefined ? patch.department : existingUser.department;
    // Clean up office & student credentials
    updateData.office = null;
    updateData.officeId = null;
    updateData.studentId = null;
    updateData.collegeId = null;
    updateData.courseId = null;
    updateData.section = null;
    updateData.yearLevel = null;
    updateData.studentStatus = null;
  } else if (targetRole === "student") {
    updateData.studentId = patch.studentId !== undefined ? patch.studentId : existingUser.studentId;
    updateData.collegeId = patch.collegeId !== undefined ? patch.collegeId : existingUser.collegeId;
    updateData.courseId = patch.courseId !== undefined ? patch.courseId : existingUser.courseId;
    updateData.section = patch.section !== undefined ? patch.section : existingUser.section;
    updateData.yearLevel = patch.yearLevel !== undefined ? patch.yearLevel : existingUser.yearLevel;
    updateData.studentStatus = patch.studentStatus !== undefined ? patch.studentStatus : existingUser.studentStatus;
    // Clean up office & teacher credentials
    updateData.office = null;
    updateData.officeId = null;
    updateData.department = null;
  } else if (targetRole === "admin") {
    // Admin cleans up incompatible non-admin credentials
    updateData.office = null;
    updateData.officeId = null;
    updateData.studentId = null;
    updateData.department = null;
  }

  return updateData;
}

function runTests() {
  console.log("Running user role transition sanitization tests...");

  const studentUser: UserRecord = {
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
  assert.strictEqual(staffUpdate.department, null);

  // Staff -> Teacher transition
  const staffUser: UserRecord = {
    ...studentUser,
    role: "staff",
    officeId: "office-our-uuid",
    office: null,
    studentId: null,
    collegeId: null,
  };

  const teacherUpdate = sanitizeRoleTransition(staffUser, {
    role: "teacher",
    department: "Computer Studies",
  });

  assert.strictEqual(teacherUpdate.role, "teacher");
  assert.strictEqual(teacherUpdate.department, "Computer Studies");
  assert.strictEqual(teacherUpdate.officeId, null);
  assert.strictEqual(teacherUpdate.office, null);

  // Teacher -> Student transition
  const teacherUser: UserRecord = {
    ...studentUser,
    role: "teacher",
    department: "Mathematics",
    studentId: null,
    collegeId: null,
  };

  const studentAgain = sanitizeRoleTransition(teacherUser, {
    role: "student",
    studentId: "TUPM-22-9999",
    collegeId: "col-science",
  });

  assert.strictEqual(studentAgain.role, "student");
  assert.strictEqual(studentAgain.studentId, "TUPM-22-9999");
  assert.strictEqual(studentAgain.department, null);

  console.log("All role transition sanitization tests passed!");
}

runTests();
