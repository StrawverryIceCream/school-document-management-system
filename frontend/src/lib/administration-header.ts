import { FileClock, type LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/tones";

export const HEADER_COPY = {
  eyebrow: "Administration Hub",
  eyebrowNote: "Real-Time Routing",
  title: "Administration",
  description:
    "Choose an administrative office to view designated queues and pending requests from faculty and staff.",
} as const;

export type HeaderPillKey = "units" | "pending";

type HeaderPillConfig = {
  key: HeaderPillKey;
  label: string;
  tone: Tone;
  // null renders a status dot instead of an icon
  icon: LucideIcon | null;
  // Pills that count requests must wait for the provider to finish loading
  needsRequests: boolean;
};

export const HEADER_PILLS: HeaderPillConfig[] = [
  {
    key: "units",
    label: "Administrative Offices Active",
    tone: "emerald",
    icon: null,
    needsRequests: false,
  },
  {
    key: "pending",
    label: "Total Pending Documents",
    tone: "amber",
    icon: FileClock,
    needsRequests: true,
  },
];