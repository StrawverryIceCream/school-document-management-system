export type AssignmentGuardResult =
  | { allowed: true }
  | {
      allowed: false;
      status: 400 | 403;
      error: string;
      auditAction?: "request.self_assignment_blocked";
    };

export type DocumentEligibilityResult =
  | { eligible: true }
  | { eligible: false; status: 400 | 401 | 403; error: string };

export function isSelfRequestAction(
  requestUserId: string,
  actorUserId: string,
): boolean {
  return requestUserId === actorUserId;
}

export function validateRequestAssignmentActors(
  requestUserId: string,
  actorId: string,
  targetUserId: string | null | undefined,
): AssignmentGuardResult {
  if (isSelfRequestAction(requestUserId, actorId)) {
    return {
      allowed: false,
      status: 403,
      error:
        "You can't assign or unassign your own request. Another staff member or admin must handle it.",
      auditAction: "request.self_assignment_blocked",
    };
  }

  if (targetUserId && isSelfRequestAction(requestUserId, targetUserId)) {
    return {
      allowed: false,
      status: 400,
      error: "A request can't be assigned to the person who made it",
    };
  }

  return { allowed: true };
}

export function isUserEligibleForDocument(
  document: {
    isActive: boolean;
    allowedCategories?: string[] | null;
    allowedStudentStatuses?: string[] | null;
  },
  user:
    | {
        role: string;
        studentStatus?: string | null;
      }
    | null
    | undefined,
): DocumentEligibilityResult {
  if (!document.isActive) {
    return {
      eligible: false,
      status: 400,
      error: "This document type is not available for requests",
    };
  }

  if (!user) {
    return {
      eligible: false,
      status: 401,
      error: "Unauthorized",
    };
  }

  if (user.role === "admin") {
    return { eligible: true };
  }

  const allowedCategories = document.allowedCategories;
  if (Array.isArray(allowedCategories) && allowedCategories.length > 0) {
    if (!allowedCategories.includes(user.role)) {
      return {
        eligible: false,
        status: 403,
        error: "You are not eligible to request this document type",
      };
    }
  }

  if (user.role === "student") {
    const allowedStatuses = document.allowedStudentStatuses;
    if (Array.isArray(allowedStatuses) && allowedStatuses.length > 0) {
      if (
        !user.studentStatus ||
        !allowedStatuses.includes(user.studentStatus)
      ) {
        return {
          eligible: false,
          status: 403,
          error: "Your student status is not eligible for this document type",
        };
      }
    }
  }

  return { eligible: true };
}
