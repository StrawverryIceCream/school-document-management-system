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
    caption: "100% Active",
    captionIcon: CircleCheck,
    captionTone: "emerald",
    icon: UsersRound,
    tone: "neutral",
  },
  {
    key: "student",
    label: "Students",
    caption: "Undergraduate",
    captionIcon: null,
    captionTone: null,
    icon: GraduationCap,
    tone: "emerald",
  },
  {
    key: "teacher",
    label: "Teachers",
    caption: "Faculty",
    captionIcon: null,
    captionTone: null,
    icon: BriefcaseBusiness,
    tone: "orange",
  },
  {
    key: "staff",
    label: "Staff",
    caption: "Operational",
    captionIcon: null,
    captionTone: null,
    icon: UserCog,
    tone: "amber",
  },
  {
    key: "admin",
    label: "Admins",
    caption: "Elevated",
    captionIcon: null,
    captionTone: null,
    icon: ShieldCheck,
    tone: "rose",
  },
];