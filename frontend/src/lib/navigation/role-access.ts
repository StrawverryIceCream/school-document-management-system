import { findOfficeRoute } from "@/lib/sectors/sectors-config";
import type { AuthUser, UserRole } from "@/types";

export const REQUESTER_ROLES: readonly UserRole[] = ["student", "teacher", "admin", "staff"];
export const STAFF_ROLES: readonly UserRole[] = ["admin", "staff"];
export const ADMIN_ROLES: readonly UserRole[] = ["admin"];

export function getDefaultHomeRoute(role: UserRole): string {
  return role === "admin" || role === "staff" ? "/dashboard" : "/home";
}

export function isRegistrarStaff(user: Pick<AuthUser, "role" | "office" | "officeRecord">): boolean {
  if (user.role !== "staff") return false;
  return (
    user.office === "registrar" ||
    user.officeRecord?.code?.toUpperCase() === "OUR"
  );
}

export function canAccessAccounts(user: Pick<AuthUser, "role" | "office" | "officeRecord">): boolean {
  return user.role === "admin";
}

export interface WorkspaceJumpLink {
  title: string;
  url: string;
}

export function getStaffWorkspaceLink(
  user: Pick<AuthUser, "role" | "office" | "officeId" | "officeRecord">,
): WorkspaceJumpLink | null {
  if (user.role === "admin") {
    return {
      title: "Sector & Office Workspaces",
      url: "/sectors/ovpaa/colleges",
    };
  }

  if (user.role !== "staff") return null;

  const resolved = findOfficeRoute({
    officeCode: user.officeRecord?.code,
    officeId: user.officeId ?? undefined,
    officeName: user.officeRecord?.name,
  });

  if (resolved) {
    return {
      title: `${resolved.office.name} Workspace`,
      url: resolved.url,
    };
  }

  if (user.office === "registrar") {
    return {
      title: "Registrar Office Workspace",
      url: "/sectors/ovpaa/academic-support/our",
    };
  }

  if (user.office === "hr") {
    return {
      title: "HRMO Workspace",
      url: "/sectors/ovpaf/admin-services/hrmo",
    };
  }

  return null;
}
