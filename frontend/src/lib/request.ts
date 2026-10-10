import { Banknote, Check, ListChecks, type LucideIcon } from "lucide-react";
import type { FilingType, RequestFilter, RequestStatus } from "@/types/request";

type RequestStatusConfig = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
  dotClassName: string;
};

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, RequestStatusConfig> = {
  in_review: {
    label: "In Review",
    icon: ListChecks,
    badgeClassName: "bg-amber-100 text-amber-900",
    dotClassName: "bg-amber-700",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    icon: Check,
    badgeClassName: "bg-emerald-100 text-emerald-900",
    dotClassName: "bg-emerald-600",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    icon: Banknote,
    badgeClassName: "bg-sky-100 text-sky-900",
    dotClassName: "bg-sky-600",
  },
};

export const FILING_TYPE_LABELS: Record<FilingType, string> = {
  standard: "Standard Filing",
  express: "Express Priority",
};

export const REQUEST_FILTERS: RequestFilter[] = ["all", "in_progress", "ready_to_claim"];

export const REQUEST_FILTER_LABELS: Record<RequestFilter, string> = {
  all: "All",
  in_progress: "In Progress",
  ready_to_claim: "Ready to Claim",
};

// Radix Tabs hands back a plain string, so narrow it before it reaches state
export function isRequestFilter(value: string): value is RequestFilter {
  return REQUEST_FILTERS.some((filter) => filter === value);
}