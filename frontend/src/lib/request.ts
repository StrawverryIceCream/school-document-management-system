import {
  Ban,
  Check,
  Clock,
  ListChecks,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import type { RequestStatus } from "@/types";

type RequestStatusConfig = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
  dotClassName: string;
};

export const REQUESTS_PAGE_SIZE = 5;

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, RequestStatusConfig> = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName: "bg-sky-100 text-sky-900",
    dotClassName: "bg-sky-600",
  },
  processing: {
    label: "Processing",
    icon: ListChecks,
    badgeClassName: "bg-amber-100 text-amber-900",
    dotClassName: "bg-amber-700",
  },
  ready: {
    label: "Ready for Pickup",
    icon: Check,
    badgeClassName: "bg-emerald-100 text-emerald-900",
    dotClassName: "bg-emerald-600",
  },
  claimed: {
    label: "Claimed",
    icon: PackageCheck,
    badgeClassName: "bg-stone-200 text-stone-800",
    dotClassName: "bg-stone-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    badgeClassName: "bg-red-100 text-red-900",
    dotClassName: "bg-red-600",
  },
};

// Remove entries here to hide a tab; "all" still lists every request
export const REQUEST_FILTERS: RequestFilter[] = [
  "all",
  "pending",
  "processing",
  "ready",
  "claimed",
  "cancelled",
];

export const REQUEST_FILTER_LABELS: Record<RequestFilter, string> = {
  all: "All",
  pending: "Pending",
  processing: "Processing",
  ready: "Ready to Claim",
  claimed: "Claimed",
  cancelled: "Cancelled",
};

export const NO_PURPOSE_LABEL = "No purpose provided";

// Radix Tabs hands back a plain string, so narrow it before it reaches state
export function isRequestFilter(value: string): value is RequestFilter {
  return REQUEST_FILTERS.some((filter) => filter === value);
}
 
// Mirrors the provider's statusFilter so the tabs can drive it directly
export type RequestFilter = "all" | RequestStatus;
 