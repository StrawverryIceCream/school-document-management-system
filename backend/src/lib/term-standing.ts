export const DEFAULT_ACADEMIC_TERM = "AY 2026–2027";

export type StudentStatus = "regular" | "irregular" | "graduating" | "alumni";
export type UserRole = "student" | "teacher" | "admin" | "staff";

export interface TermVerificationTargetUser {
  role: string;
  studentStatus?: string | null;
  verifiedAcademicTerm?: string | null;
}

export function needsAcademicTermVerification(
  user: TermVerificationTargetUser | null | undefined,
  activeTerm: string,
): boolean {
  if (!user) return false;
  // Non-students are never gated
  if (user.role !== "student") return false;
  // Alumni are exempt from re-verification
  if (user.studentStatus === "alumni") return false;
  // If verifiedAcademicTerm is not set or does not match active term, verification is required
  if (!user.verifiedAcademicTerm) return true;
  return user.verifiedAcademicTerm.trim() !== activeTerm.trim();
}

export interface ApprovedStandingInput {
  academicTerm: string;
  requestedYearLevel?: number | null;
  requestedSection?: string | null;
  requestedStudentStatus: string;
}

export interface ApprovedStandingPatch {
  yearLevel: number | null;
  section: string | null;
  studentStatus: string;
  verifiedAcademicTerm: string;
}

export function buildApprovedStandingPatch(
  input: ApprovedStandingInput,
): ApprovedStandingPatch {
  const isAlumni = input.requestedStudentStatus === "alumni";
  return {
    yearLevel: isAlumni ? null : (input.requestedYearLevel ?? null),
    section: isAlumni ? null : (input.requestedSection?.trim() || null),
    studentStatus: input.requestedStudentStatus,
    verifiedAcademicTerm: input.academicTerm.trim(),
  };
}

export function validateRequestedStanding(input: {
  requestedStudentStatus: string;
  requestedYearLevel?: number | null;
  requestedSection?: string | null;
}): { valid: boolean; error?: string } {
  const validStatuses = ["regular", "irregular", "graduating", "alumni"];
  if (!validStatuses.includes(input.requestedStudentStatus)) {
    return { valid: false, error: "Invalid requested student status." };
  }
  if (input.requestedStudentStatus !== "alumni") {
    if (
      input.requestedYearLevel === undefined ||
      input.requestedYearLevel === null ||
      input.requestedYearLevel < 1 ||
      input.requestedYearLevel > 6
    ) {
      return {
        valid: false,
        error: "Year level must be between 1 and 6 for enrolled students.",
      };
    }
  }
  return { valid: true };
}
