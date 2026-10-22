import { CircleCheck, type LucideIcon } from "lucide-react";
import { ROLE_META } from "@/lib/profile";
import type { Tone } from "@/lib/tones";
import type { User, UserRole } from "@/types";

export const ROLE_TONES: Record<UserRole, Tone> = {
  student: "emerald",
  teacher: "orange",
  staff: "amber",
  admin: "rose",
};

type AccountStatus = {
  label: string;
  tone: Tone;
  icon: LucideIcon;
};

// The backend has no account status yet, so every account shows as active
export const ACCOUNT_STATUS: AccountStatus = {
  label: "Active",
  tone: "emerald",
  icon: CircleCheck,
};

type TableColumn = {
  key: string;
  label: string;
  className: string;
};

export const TABLE_COLUMNS: TableColumn[] = [
  { key: "id", label: "ID", className: "w-36" },
  { key: "name", label: "Name", className: "min-w-56 max-w-xs" },
  { key: "email", label: "Email", className: "min-w-56 max-w-xs" },
  { key: "role", label: "Role", className: "w-28" },
  { key: "officeDept", label: "Office / Dept", className: "min-w-36 max-w-xs" },
  { key: "studentId", label: "Student ID", className: "w-36" },
  { key: "status", label: "Status", className: "w-28" },
];

export const ACTION_COLUMN_LABEL = "Action";
// Checkbox and action columns sit on either side of TABLE_COLUMNS
export const TABLE_COLUMN_COUNT = TABLE_COLUMNS.length + 2;

export const SELECT_ALL_LABEL = "Select all accounts on this page";
export const EMPTY_MESSAGE = "No accounts match your current filters.";
export const ERROR_PREFIX = "Something went wrong:";
export const YOU_LABEL = "YOU";

const SKELETON_ROW_COUNT = 6;
export const SKELETON_ROW_KEYS = Array.from(
  { length: SKELETON_ROW_COUNT },
  (_, index) => `skeleton-row-${index}`,
);

export const COPY_FEEDBACK_MS = 2000;
const SHORT_ID_PREFIX_LENGTH = 8;
const SHORT_ID_SUFFIX_LENGTH = 4;

export function formatShortId(id: string): string {
  if (id.length <= SHORT_ID_PREFIX_LENGTH + SHORT_ID_SUFFIX_LENGTH) return id;
  return `${id.slice(0, SHORT_ID_PREFIX_LENGTH)}…${id.slice(-SHORT_ID_SUFFIX_LENGTH)}`;
}

// The mockup shows a job title under each name; the closest stored field is the department
export function getAccountSubtitle(user: User): string {
  return (
    user.department?.trim() ||
    user.courseId?.trim() ||
    ROLE_META[user.role].label
  );
}
