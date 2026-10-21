import type { DocumentType, AuthUser } from "@/types";

/**
 * Checks whether an authenticated user is eligible to request a given document type.
 */
export function isDocumentEligible(
  document: DocumentType,
  user?: AuthUser | null,
): boolean {
  if (!document.isActive) {
    return false;
  }

  // If no user context is provided, default to active check
  if (!user) {
    return true;
  }

  // 1. Role / Category check
  const allowedCategories = document.allowedCategories;
  if (Array.isArray(allowedCategories) && allowedCategories.length > 0) {
    if (!allowedCategories.includes(user.role)) {
      return false;
    }
  }

  // 2. Student status check (only applies if user is a student)
  if (user.role === "student") {
    const allowedStatuses = document.allowedStudentStatuses;
    if (Array.isArray(allowedStatuses) && allowedStatuses.length > 0) {
      if (!user.studentStatus || !allowedStatuses.includes(user.studentStatus)) {
        return false;
      }
    }
  }

  return true;
}
