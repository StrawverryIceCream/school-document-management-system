import {
  Briefcase,
  Building,
  Building2,
  GraduationCap,
  IdCard,
  Layers,
  Mail,
  Phone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getTupIdLabel, NO_TUP_ID_LABEL } from "@/lib/profile";
import {
  officeLabels,
  userRoles,
  type AuthUser,
  type UserRole,
  type UserWithOrg,
} from "@/types";

// College and course names only exist when the API returns the user with its organization resolved
export type ProfileUser = AuthUser &
  Partial<Pick<UserWithOrg, "college" | "course">>;

type ProfileFieldConfig = {
  key: string;
  label: string;
  icon: LucideIcon;
  // Roles that own this field. An admin also sees it whenever the account has a value
  roles: readonly UserRole[];
  getValue: (user: ProfileUser) => string | null | undefined;
  // Shown muted when an owning role has no value. Omit it to hide the field when empty
  emptyLabel?: string;
};

export type ProfileFieldItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  value: string;
  isEmpty: boolean;
};

const ADMIN_ROLE: UserRole = "admin";
const NOT_PROVIDED_LABEL = "Not provided";

// Order here is the order on screen. Add a field by adding one entry
export const PROFILE_FIELDS: readonly ProfileFieldConfig[] = [
  {
    key: "email",
    label: "Email",
    icon: Mail,
    roles: userRoles,
    getValue: (user) => user.email,
  },
  {
    key: "contactNumber",
    label: "Contact number",
    icon: Phone,
    roles: userRoles,
    getValue: (user) => user.contactNumber,
    emptyLabel: NOT_PROVIDED_LABEL,
  },
  {
    key: "tupId",
    label: "TUP ID",
    icon: IdCard,
    roles: ["student"],
    getValue: (user) => {
      const label = getTupIdLabel(user.studentId);
      return label === NO_TUP_ID_LABEL ? null : label;
    },
    emptyLabel: NO_TUP_ID_LABEL,
  },
  {
    key: "yearLevel",
    label: "Year level",
    icon: Layers,
    roles: ["student"],
    getValue: (user) =>
      user.yearLevel == null ? null : `Year ${user.yearLevel}`,
  },
  {
    key: "section",
    label: "Section",
    icon: Users,
    roles: ["student"],
    getValue: (user) => user.section,
  },
  {
    key: "college",
    label: "College",
    icon: Building2,
    roles: ["student"],
    getValue: (user) => user.college?.name,
    emptyLabel: NOT_PROVIDED_LABEL,
  },
  {
    key: "course",
    label: "Degree program",
    icon: GraduationCap,
    roles: ["student"],
    getValue: (user) => user.course?.name,
    emptyLabel: NOT_PROVIDED_LABEL,
  },
  {
    key: "department",
    label: "Department",
    icon: Building,
    roles: ["teacher", "staff"],
    getValue: (user) => user.department,
  },
  {
    key: "office",
    label: "Office",
    icon: Briefcase,
    roles: ["staff"],
    getValue: (user) => (user.office ? officeLabels[user.office] : null),
  },
];

// Resolves the config against one user, so the dialog and the popover always show the same rows
export function getProfileFields(user: ProfileUser): ProfileFieldItem[] {
  const items: ProfileFieldItem[] = [];

  for (const field of PROFILE_FIELDS) {
    const ownsField = field.roles.includes(user.role);

    // An admin account may have been a student or teacher first, so it keeps any data it still has
    if (!ownsField && user.role !== ADMIN_ROLE) continue;

    const value = field.getValue(user)?.trim();

    if (value) {
      items.push({
        key: field.key,
        label: field.label,
        icon: field.icon,
        value,
        isEmpty: false,
      });
    } else if (ownsField && field.emptyLabel) {
      items.push({
        key: field.key,
        label: field.label,
        icon: field.icon,
        value: field.emptyLabel,
        isEmpty: true,
      });
    }
  }

  return items;
}