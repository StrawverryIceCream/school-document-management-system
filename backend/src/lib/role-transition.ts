export type UserRole = "student" | "teacher" | "admin" | "staff";
export type LegacyOffice = "registrar" | "hr";
export type StudentStatus = "regular" | "irregular" | "graduating" | "alumni";

const STUDENT_STATUS_VALUES: readonly StudentStatus[] = [
  "regular",
  "irregular",
  "graduating",
  "alumni",
];
const STUDENT_ID_REGEX = /^TUPM-\d{2}-\d{4,5}$/;

export interface RoleTransitionUserRecord {
  id: string;
  role: UserRole;
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

export interface RoleTransitionPatch {
  role?: UserRole;
  fullName?: string;
  email?: string;
  isActive?: boolean;
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

export interface RoleTransitionUpdateData {
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  studentId?: string | null;
  collegeId?: string | null;
  courseId?: string | null;
  section?: string | null;
  yearLevel?: number | null;
  studentStatus?: StudentStatus | null;
  department?: string | null;
  office?: LegacyOffice | null;
  officeId?: string | null;
}

export class RoleTransitionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleTransitionValidationError";
  }
}

function normalizeStudentStatus(
  raw: string | null | undefined,
): StudentStatus | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if ((STUDENT_STATUS_VALUES as readonly string[]).includes(trimmed)) {
    return trimmed as StudentStatus;
  }
  throw new RoleTransitionValidationError(
    "Invalid student status. Must be regular, irregular, graduating, or alumni.",
  );
}

function normalizeStudentId(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const upper = raw.trim().toUpperCase();
  if (!upper) return null;
  if (!STUDENT_ID_REGEX.test(upper)) {
    throw new RoleTransitionValidationError(
      "Student ID must follow the format TUPM-XX-XXXX or TUPM-XX-XXXXX.",
    );
  }
  return upper;
}

function cleanOptionalText(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  return raw.trim() || null;
}

export function sanitizeRoleTransition(
  existingUser: RoleTransitionUserRecord,
  patch: RoleTransitionPatch,
): RoleTransitionUpdateData {
  const targetRole = patch.role ?? existingUser.role;
  const updateData: RoleTransitionUpdateData = {};

  if (patch.fullName !== undefined) updateData.fullName = patch.fullName;
  if (patch.email !== undefined) updateData.email = patch.email;
  if (patch.role !== undefined) updateData.role = patch.role;
  if (patch.isActive !== undefined) updateData.isActive = patch.isActive;

  if (targetRole === "staff") {
    updateData.officeId =
      patch.officeId !== undefined
        ? cleanOptionalText(patch.officeId)
        : existingUser.officeId;
    updateData.office = (
      patch.office !== undefined ? patch.office : existingUser.office
    ) as LegacyOffice | null;
    if (!updateData.officeId && !updateData.office) {
      throw new RoleTransitionValidationError(
        "Staff role requires an assigned office",
      );
    }
    updateData.studentId = null;
    updateData.collegeId = null;
    updateData.courseId = null;
    updateData.section = null;
    updateData.yearLevel = null;
    updateData.studentStatus = null;
    updateData.department = null;
  } else if (targetRole === "teacher") {
    updateData.department =
      patch.department !== undefined
        ? cleanOptionalText(patch.department)
        : existingUser.department;
    updateData.office = null;
    updateData.officeId = null;
    updateData.studentId = null;
    updateData.collegeId = null;
    updateData.courseId = null;
    updateData.section = null;
    updateData.yearLevel = null;
    updateData.studentStatus = null;
  } else if (targetRole === "student") {
    const nextCourseId =
      patch.courseId !== undefined
        ? cleanOptionalText(patch.courseId)
        : existingUser.courseId;

    if (
      !nextCourseId &&
      (existingUser.role !== "student" ||
        (patch.courseId !== undefined && existingUser.courseId !== null))
    ) {
      throw new RoleTransitionValidationError(
        "Student role requires an assigned degree program (course)",
      );
    }

    const nextStudentStatus = normalizeStudentStatus(
      patch.studentStatus !== undefined
        ? patch.studentStatus
        : existingUser.studentStatus,
    );
    const isAlumni = nextStudentStatus === "alumni";

    const nextSection = isAlumni
      ? null
      : patch.section !== undefined
        ? cleanOptionalText(patch.section)
        : cleanOptionalText(existingUser.section);

    if (!nextCourseId && nextSection) {
      throw new RoleTransitionValidationError(
        "A degree program (course) is required before assigning a section",
      );
    }

    const rawNextYearLevel =
      patch.yearLevel !== undefined ? patch.yearLevel : existingUser.yearLevel;
    const nextYearLevel = isAlumni ? null : rawNextYearLevel;
    if (
      nextYearLevel !== null &&
      nextYearLevel !== undefined &&
      (!Number.isInteger(nextYearLevel) || nextYearLevel < 1 || nextYearLevel > 6)
    ) {
      throw new RoleTransitionValidationError(
        "Year level must be between 1 and 6",
      );
    }

    const nextCollegeId =
      patch.collegeId !== undefined
        ? cleanOptionalText(patch.collegeId)
        : existingUser.collegeId;
    const nextStudentId =
      patch.studentId !== undefined
        ? normalizeStudentId(patch.studentId)
        : existingUser.studentId;

    updateData.studentId = nextStudentId;
    updateData.collegeId = nextCollegeId;
    updateData.courseId = nextCourseId;
    updateData.section = nextSection;
    updateData.yearLevel = nextYearLevel;
    updateData.studentStatus = nextStudentStatus;
    updateData.office = null;
    updateData.officeId = null;
    updateData.department = null;
  } else if (targetRole === "admin") {
    updateData.office = (
      patch.office !== undefined
        ? patch.office || null
        : existingUser.office
    ) as LegacyOffice | null;
    updateData.officeId =
      patch.officeId !== undefined
        ? cleanOptionalText(patch.officeId)
        : existingUser.officeId;
    updateData.department =
      patch.department !== undefined
        ? cleanOptionalText(patch.department)
        : existingUser.department;
    updateData.studentId = null;
    updateData.yearLevel = null;
    updateData.section = null;
    updateData.studentStatus = null;
    updateData.courseId = null;
    if (patch.collegeId !== undefined) {
      updateData.collegeId = cleanOptionalText(patch.collegeId);
    }
  }

  return updateData;
}
