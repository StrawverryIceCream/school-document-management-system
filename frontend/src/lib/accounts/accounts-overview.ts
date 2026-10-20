import {
  BriefcaseBusiness,
  CircleCheck,
  GraduationCap,
  ShieldCheck,
  UserCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { RoleCounts } from "@/context/UsersContext";
import type { Tone } from "@/lib/tones";

export const OVERVIEW_ARIA_LABEL = "Accounts overview";
export const COUNT_PLACEHOLDER = "—";

type StatConfig = {
  key: keyof RoleCounts;
  label: string;
  caption: string;
  captionIcon: LucideIcon | null;
  // null renders the caption in the muted theme color instead of a tint
  captionTone: Tone | null;
  icon: LucideIcon;
  tone: Tone;
};

export const STAT_CONFIGS: StatConfig[] = [
  {
    key: "total",
    label: "Total Accounts",
    caption: "Institutional user accounts",
    captionIcon: CircleCheck,
    captionTone: "brand",
    icon: UsersRound,
    tone: "brand",
  },
  {
    key: "student",
    label: "Students",
    caption: "Enrolled student learners",
    captionIcon: null,
    captionTone: "emerald",
    icon: GraduationCap,
    tone: "emerald",
  },
  {
    key: "teacher",
    label: "Teachers",
    caption: "Academic faculty members",
    captionIcon: null,
    captionTone: "sky",
    icon: BriefcaseBusiness,
    tone: "sky",
  },
  {
    key: "staff",
    label: "Staff",
    caption: "Operational & window staff",
    captionIcon: null,
    captionTone: "amber",
    icon: UserCog,
    tone: "amber",
  },
  {
    key: "admin",
    label: "Admins",
    caption: "Administrative authority",
    captionIcon: null,
    captionTone: "rose",
    icon: ShieldCheck,
    tone: "rose",
  },
];