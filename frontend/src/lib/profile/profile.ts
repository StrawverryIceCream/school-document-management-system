import type { UserRole } from "@/types";

// Avatar fallbacks, role badges, and TUP ID formatting for the profile UI.
// Which fields each role shows lives in fields.ts.

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return (firstName[0] + lastName[0]).toUpperCase();
}

type RoleBadgeVariant = "default" | "secondary" | "outline" | "destructive";

interface RoleMeta {
  label: string;
  variant: RoleBadgeVariant;
}

// Record<UserRole, ...> makes the compiler flag any role added to the type but missing here
export const ROLE_META: Record<UserRole, RoleMeta> = {
  student: { label: "Student", variant: "secondary" },
  teacher: { label: "Teacher", variant: "outline" },
  staff: { label: "Staff", variant: "default" },
  admin: { label: "Admin", variant: "destructive" },
};

// Mirrors requireRoles("admin", "staff") on GET /api/users/:id; only these roles can open profiles
export const PROFILE_VIEWER_ROLES: readonly UserRole[] = ["admin", "staff"];

export const NO_TUP_ID_LABEL = "No TUP ID";

// Rows saved with only the prefix ("TUP-M-" or "TUPM-") are signup placeholders, not real IDs
export function getTupIdLabel(studentId: string | null | undefined): string {
  const value = studentId?.trim() ?? "";
  const isPlaceholder = /^TUP-?M-?$/i.test(value);
  return value && !isPlaceholder ? value : NO_TUP_ID_LABEL;
}