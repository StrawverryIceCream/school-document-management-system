import { GraduationCap, Users, type LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/tones";
import type { UserRole } from "@/types";

// Matches the existing signup() payload's STUDENT_ID_PREFIX convention — replace
// with your real exported constant if one already lives in @/types or @/lib.
export const STUDENT_ID_PREFIX = "TUPM-";

export const MIN_PASSWORD_LENGTH = 8;

type RoleOption = {
  role: Extract<UserRole, "student" | "teacher">;
  label: string;
  description: string;
  icon: LucideIcon;
};

// Only student / teacher are offered here — the mockup's role selector has no
// admin or staff card. Extend this array if the form should cover those too.
export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "student",
    label: "Student",
    description: "Undergraduate, Graduate & Alumni credential requests",
    icon: GraduationCap,
  },
  {
    role: "teacher",
    label: "Teacher / Faculty",
    description: "Faculty employment records, load clearance & grade slips",
    icon: Users,
  },
];

type ProgramOption = {
  value: string;
  label: string;
  course: string;
  college: string;
};

// The mockup combines "college" and "course" into one Degree Program select.
// This config splits each option back into the two fields signup() expects.
export const PROGRAM_OPTIONS: ProgramOption[] = [
  {
    value: "bs-bio",
    label: "BS Biology (College of Science)",
    course: "BS Biology",
    college: "College of Science",
  },
  {
    value: "bs-cs",
    label: "BS Computer Science (Information Tech)",
    course: "BS Computer Science",
    college: "Information Technology Department",
  },
  {
    value: "bs-ce",
    label: "BS Civil Engineering (College of Eng)",
    course: "BS Civil Engineering",
    college: "College of Engineering",
  },
  {
    value: "bs-arch",
    label: "BS Architecture (Architecture & Fine Arts)",
    course: "BS Architecture",
    college: "College of Architecture & Fine Arts",
  },
  {
    value: "bs-ba",
    label: "BS Business Administration (Management & MS)",
    course: "BS Business Administration",
    college: "Management & Business Studies",
  },
  {
    value: "b-ied",
    label: "Bachelor of Industrial Education (BIE)",
    course: "Bachelor of Industrial Education",
    college: "Industrial Education",
  },
];

export const studentStatuses = [
  "regular",
  "irregular",
  "graduating",
  "alumni",
] as const;

export type StudentStatus = (typeof studentStatuses)[number];

type StudentStatusOption = {
  value: StudentStatus;
  label: string;
};

// Display-only — signup() has no field for this yet, so it is not sent in the
// payload. Tell me if the backend should start accepting it.
export const STUDENT_STATUS_OPTIONS: StudentStatusOption[] = [
  { value: "regular", label: "Currently Enrolled (Regular)" },
  { value: "irregular", label: "Currently Enrolled (Irregular)" },
  { value: "graduating", label: "Graduating Senior (Final Semester)" },
  { value: "alumni", label: "Alumni / Former Student" },
];

type DepartmentOption = {
  value: string;
  label: string;
};

// Maps directly onto signup()'s "department" field for the teacher role.
export const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { value: "cos", label: "College of Science (Physical & Natural Sciences)" },
  { value: "coe", label: "College of Engineering (Civil, Mech, Electrical)" },
  { value: "cafo", label: "College of Architecture & Fine Arts" },
  { value: "cit", label: "Information Technology Department" },
  { value: "cmms", label: "Management & Business Studies" },
  { value: "cie", label: "Industrial Education" },
];

export const facultyRanks = [
  "inst1",
  "asst1",
  "assoc1",
  "prof1",
  "lecturer",
] as const;

export type FacultyRank = (typeof facultyRanks)[number];

type FacultyRankOption = {
  value: FacultyRank;
  label: string;
};

// Display-only, like student status above — signup() has no slot for rank,
// faculty employee ID, or clearance officer yet. All three are collected here
// but left out of the submitted payload until the backend has fields for them.
export const FACULTY_RANK_OPTIONS: FacultyRankOption[] = [
  { value: "inst1", label: "Instructor I–III" },
  { value: "asst1", label: "Assistant Professor I–IV" },
  { value: "assoc1", label: "Associate Professor" },
  { value: "prof1", label: "Full Professor" },
  { value: "lecturer", label: "Part-time Lecturer" },
];

// Theme tokens drive the role-selection state (it's the app's primary action
// color, not an arbitrary tint). TONES only backs the two genuinely tinted
// accents below.
export const SYNC_BADGE_TONE: Tone = "emerald";
export const COMPLIANCE_NOTICE_TONE: Tone = "amber";