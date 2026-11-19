import {
  officeLabels,
  studentStatusLabels,
  type RequiredFieldDefinition,
  type UserRole,
} from "@/types";
import type { ProfileUser } from "./fields";
import { getTupIdLabel, NO_TUP_ID_LABEL, ROLE_META } from "./profile";

const NOT_PROVIDED = "Not provided";

export interface RequesterProfileTile {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}

export interface RequesterProfileSummary {
  roleLabel: string;
  badgeLabel: string;
  badgeVariant: (typeof ROLE_META)[UserRole]["variant"];
  subtitle: string;
  tiles: RequesterProfileTile[];
  primaryIdentifier: {
    label: string;
    value: string;
    hasValue: boolean;
  };
  idRequirementLabel: string;
}

const ROLE_DISPLAY_LABEL: Record<UserRole, string> = {
  student: "Student",
  teacher: "Faculty / Teacher",
  staff: "Office Staff",
  admin: "Administrator",
};

const ROLE_SUBTITLE: Record<UserRole, string> = {
  student: "Institutional Student Record",
  teacher: "Faculty Directory Record",
  staff: "Office Staff Directory Record",
  admin: "University Administrator Account",
};

const ROLE_ID_REQUIREMENT: Record<UserRole, string> = {
  student: "University Student ID",
  teacher: "University Faculty / Employee ID",
  staff: "University Staff ID",
  admin: "Valid University ID",
};

export function getRoleIdRequirementLabel(role?: UserRole | null): string {
  return role ? ROLE_ID_REQUIREMENT[role] : "Valid University ID";
}

function getResolvedOfficeName(user: ProfileUser): string | null {
  return (
    user.officeRecord?.name?.trim() ||
    (user.office ? officeLabels[user.office] : null) ||
    null
  );
}

function getResolvedTupId(user: ProfileUser): string | null {
  const label = getTupIdLabel(user.studentId);
  return label === NO_TUP_ID_LABEL ? null : label;
}

function formatStudentStanding(user: ProfileUser): {
  value: string;
  detail: string;
} {
  const statusLabel = user.studentStatus
    ? studentStatusLabels[user.studentStatus]
    : null;

  if (user.studentStatus === "alumni") {
    return {
      value: "Alumni",
      detail: "Graduated / Alumni Standing",
    };
  }

  const parts: string[] = [];
  if (user.yearLevel != null) parts.push(`Year ${user.yearLevel}`);
  if (user.section?.trim()) parts.push(`Section ${user.section.trim()}`);

  return {
    value: parts.length > 0 ? parts.join(" • ") : NOT_PROVIDED,
    detail: statusLabel ? `Status: ${statusLabel}` : "Academic Standing",
  };
}

export function getRequesterProfileSummary(
  user: ProfileUser,
): RequesterProfileSummary {
  const role = user.role;
  const roleMeta = ROLE_META[role];
  const fullName = user.fullName?.trim() || roleMeta.label;
  const email = user.email?.trim() || NOT_PROVIDED;
  const contact = user.contactNumber?.trim() || NOT_PROVIDED;
  const department = user.department?.trim() || null;
  const officeName = getResolvedOfficeName(user);
  const tupId = getResolvedTupId(user);

  if (role === "student") {
    const standing = formatStudentStanding(user);
    const courseName = user.course?.name?.trim() || null;
    const collegeName = user.college?.name?.trim() || null;
    const programValue = courseName ?? collegeName ?? NOT_PROVIDED;
    const programDetail =
      courseName && collegeName ? collegeName : "Institutional Registry Record";

    return {
      roleLabel: ROLE_DISPLAY_LABEL.student,
      badgeLabel: roleMeta.label,
      badgeVariant: roleMeta.variant,
      subtitle: ROLE_SUBTITLE.student,
      tiles: [
        {
          label: "Student Name",
          value: fullName,
          detail: email,
        },
        {
          label: "TUP ID Number",
          value: tupId ?? NOT_PROVIDED,
          detail: standing.detail,
          accent: Boolean(tupId),
        },
        {
          label: "Academic Program",
          value: programValue,
          detail: programDetail,
        },
        {
          label: "Year & Standing",
          value: standing.value,
          detail: standing.detail,
        },
      ],
      primaryIdentifier: {
        label: "TUP ID No.",
        value: tupId ?? NOT_PROVIDED,
        hasValue: Boolean(tupId),
      },
      idRequirementLabel: ROLE_ID_REQUIREMENT.student,
    };
  }

  if (role === "teacher") {
    return {
      roleLabel: ROLE_DISPLAY_LABEL.teacher,
      badgeLabel: roleMeta.label,
      badgeVariant: roleMeta.variant,
      subtitle: ROLE_SUBTITLE.teacher,
      tiles: [
        {
          label: "Faculty Name",
          value: fullName,
          detail: email,
        },
        {
          label: "Account Role",
          value: ROLE_DISPLAY_LABEL.teacher,
          detail: "Verified Institutional Account",
          accent: true,
        },
        {
          label: "Department",
          value: department ?? NOT_PROVIDED,
          detail: "Academic Unit",
        },
        {
          label: "Contact Number",
          value: contact,
          detail: "Registered Contact",
        },
      ],
      primaryIdentifier: {
        label: "Department",
        value: department ?? NOT_PROVIDED,
        hasValue: Boolean(department),
      },
      idRequirementLabel: ROLE_ID_REQUIREMENT.teacher,
    };
  }

  if (role === "staff") {
    return {
      roleLabel: ROLE_DISPLAY_LABEL.staff,
      badgeLabel: roleMeta.label,
      badgeVariant: roleMeta.variant,
      subtitle: ROLE_SUBTITLE.staff,
      tiles: [
        {
          label: "Staff Name",
          value: fullName,
          detail: email,
        },
        {
          label: "Account Role",
          value: ROLE_DISPLAY_LABEL.staff,
          detail: "Verified Institutional Account",
          accent: true,
        },
        {
          label: "Assigned Office",
          value: officeName ?? NOT_PROVIDED,
          detail: department ?? "Processing Office",
        },
        {
          label: "Contact Number",
          value: contact,
          detail: "Registered Contact",
        },
      ],
      primaryIdentifier: {
        label: "Assigned Office",
        value: officeName ?? NOT_PROVIDED,
        hasValue: Boolean(officeName),
      },
      idRequirementLabel: ROLE_ID_REQUIREMENT.staff,
    };
  }

  // admin
  const unitValue = officeName ?? department ?? "University Administration";
  return {
    roleLabel: ROLE_DISPLAY_LABEL.admin,
    badgeLabel: roleMeta.label,
    badgeVariant: roleMeta.variant,
    subtitle: ROLE_SUBTITLE.admin,
    tiles: [
      {
        label: "Full Name",
        value: fullName,
        detail: email,
      },
      {
        label: "Account Role",
        value: ROLE_DISPLAY_LABEL.admin,
        detail: "System Administration",
        accent: true,
      },
      {
        label: "Assigned Unit",
        value: unitValue,
        detail: "Institutional Placement",
      },
      {
        label: "Contact Number",
        value: contact,
        detail: "Registered Contact",
      },
    ],
    primaryIdentifier: {
      label: "Account Role",
      value: ROLE_DISPLAY_LABEL.admin,
      hasValue: true,
    },
    idRequirementLabel: ROLE_ID_REQUIREMENT.admin,
  };
}

export function getInitialRequiredFieldValue(
  user: ProfileUser | null | undefined,
  field: Pick<RequiredFieldDefinition, "key" | "label" | "type">,
): string | number | boolean {
  if (field.type === "number") return 1;
  if (field.type === "checkbox") return false;
  if (!user) return "";

  const lowerKey = field.key.toLowerCase();
  const lowerLabel = field.label.toLowerCase();

  if (
    lowerKey === "student-name" ||
    lowerKey === "requester-name" ||
    lowerKey === "faculty-name" ||
    lowerKey === "employee-name" ||
    lowerKey === "full-name" ||
    lowerLabel.includes("full name") ||
    lowerLabel.includes("student name") ||
    lowerLabel.includes("faculty name") ||
    lowerLabel.includes("requester name") ||
    lowerLabel.includes("employee name")
  ) {
    return user.fullName || "";
  }

  if (lowerKey === "student-id" || lowerLabel.includes("student id")) {
    return user.role === "student" ? (getResolvedTupId(user) ?? "") : "";
  }

  if (
    lowerKey === "student-course-section" ||
    lowerLabel.includes("course") ||
    lowerLabel.includes("program")
  ) {
    if (user.role !== "student") return "";
    const parts = [user.course?.name?.trim(), user.section?.trim()].filter(
      Boolean,
    );
    return parts.join(" - ");
  }

  if (lowerKey === "department" || lowerLabel.includes("department")) {
    return user.department?.trim() || user.college?.name?.trim() || "";
  }

  if (lowerKey === "office" || lowerLabel.includes("office")) {
    return getResolvedOfficeName(user) ?? "";
  }

  if (lowerKey === "email" || lowerLabel.includes("email")) {
    return user.email || "";
  }

  if (
    lowerKey === "contact" ||
    lowerKey === "contact-number" ||
    lowerLabel.includes("contact") ||
    lowerLabel.includes("phone")
  ) {
    return user.contactNumber?.trim() || "";
  }

  return "";
}
