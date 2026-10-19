import type { RoleCounts } from "@/context/UsersContext";
import type { UserRole } from "@/types";

export const SEARCH_PLACEHOLDER = "Search by name, email or student ID...";
export const SEARCH_ARIA_LABEL = "Search accounts";
export const TABS_ARIA_LABEL = "Filter accounts by role";

// Radix tab values can't be an empty string, so "All" gets its own value
export const ALL_TAB_VALUE = "all";

type RoleTab = {
  value: string;
  role: UserRole | "";
  label: string;
  countKey: keyof RoleCounts;
};

export const ROLE_TABS: RoleTab[] = [
  { value: ALL_TAB_VALUE, role: "", label: "All", countKey: "total" },
  { value: "student", role: "student", label: "Students", countKey: "student" },
  { value: "teacher", role: "teacher", label: "Teachers", countKey: "teacher" },
  { value: "staff", role: "staff", label: "Staff", countKey: "staff" },
  { value: "admin", role: "admin", label: "Admin", countKey: "admin" },
];