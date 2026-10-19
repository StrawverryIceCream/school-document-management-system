import {
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
}[] = [
  { status: "processing", label: "Start or resume processing", icon: Play },
  { status: "on_hold", label: "Place on hold", icon: Pause },
  { status: "rejected", label: "Reject request", icon: XCircle },
  { status: "ready", label: "Mark ready", icon: CheckCircle2 },
  { status: "claimed", label: "Mark claimed", icon: PackageCheck },
];
