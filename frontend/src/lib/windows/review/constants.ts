import {
  Ban,
  CheckCircle2,
  PackageCheck,
  Pause,
  Play,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { RequestStatus } from "@/types";

export const ATTACHMENTS_FETCH_LIMIT = 100;

export const REVIEW_ACTIONS: {
  status: RequestStatus;
  label: string;
  icon: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary";
}[] = [
  { status: "processing", label: "Start or resume processing", icon: Play },
  { status: "on_hold", label: "Place on hold", icon: Pause },
  { status: "ready", label: "Mark ready", icon: CheckCircle2 },
  { status: "claimed", label: "Mark claimed", icon: PackageCheck },
  {
    status: "rejected",
    label: "Reject request",
    icon: XCircle,
    variant: "destructive",
  },
  {
    status: "cancelled",
    label: "Cancel request",
    icon: Ban,
    variant: "destructive",
  },
];

export const REJECTION_REASON_PRESETS = [
  "Missing required attachments or unclear document scans",
  "Unsettled academic or clearance obligations",
  "Ineligible for requested credential under current student status",
  "Discrepancy in applicant identification details",
] as const;

export const CANCELLATION_REASON_PRESETS = [
  "Duplicate request submitted by requester",
  "Requester requested cancellation / withdrawal",
  "Administrative void due to scheduling or superseded record",
] as const;

