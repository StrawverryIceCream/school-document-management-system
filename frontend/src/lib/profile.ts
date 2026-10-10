import type { UserRole } from "@/types";

// Avatar fallbacks, role badges, and the contact fields the profile UI shows.
// TUP ID / contact number are derived here because the backend doesn't store
// them yet (see getContactNumber's mock-data note).

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

const NO_TUP_ID_LABEL = "No TUP ID";

// Rows saved with only the prefix ("TUP-M-" or "TUPM-") are signup placeholders, not real IDs
export function getTupIdLabel(studentId: string | null | undefined): string {
  const value = studentId?.trim() ?? "";
  const isPlaceholder = /^TUP-?M-?$/i.test(value);
  return value && !isPlaceholder ? value : NO_TUP_ID_LABEL;
}

const HASH_MULTIPLIER = 31;
const MOBILE_SUFFIX_DIGITS = 9;

// MOCK DATA: users have no contact number in the database yet, so a stable fake mobile number
// is derived from the user id. Replace the body with the real field once the backend provides one.
export function getContactNumber(userId: string): string {
  let hash = 0;
  for (const char of userId) {
    hash = (hash * HASH_MULTIPLIER + char.charCodeAt(0)) >>> 0;
  }
  const digits = String(hash % 10 ** MOBILE_SUFFIX_DIGITS).padStart(
    MOBILE_SUFFIX_DIGITS,
    "0",
  );
  return `09${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}