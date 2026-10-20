import { FileClock, type LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/tones";
import type { RequestStatus } from "@/types";

export const PENDING_STATUS: RequestStatus = "pending";

export const HEADER_COPY = {
  eyebrow: "Academic Counter Hub",
  eyebrowNote: "Real-Time Routing",
  title: "Windows",
  description:
    "Choose a college or department to view designated counter queues, pending credentials, and evaluation windows.",
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
    label: "Academic Units Active",
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