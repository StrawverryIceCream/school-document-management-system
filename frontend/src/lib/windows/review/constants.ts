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
