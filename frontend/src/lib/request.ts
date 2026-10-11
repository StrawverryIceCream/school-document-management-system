import type { DocumentRequestWithRelations, RequestStatus } from "@/types";
import type { RequestRow } from "@/context/DashboardContext";
import {
  Ban,
  Check,
  Clock,
  ListChecks,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

type RequestStatusConfig = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
  dotClassName: string;
};

// Tailwind classes per request status, used for the colored status badge in
// RequestTable. Adjust one status's colors here without affecting the others.
export const statusStyles: Record<RequestStatus, string> = {
  pending:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  processing:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  ready:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  claimed:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  cancelled:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

export const REQUESTS_PAGE_SIZE = 5;

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, RequestStatusConfig> =
  {
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

export type RequestFilter = "all" | RequestStatus;

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

export function isRequestFilter(value: string): value is RequestFilter {
  return REQUEST_FILTERS.some((filter) => filter === value);
}

// Converts one raw row from the real /api/requests endpoint into the shape
// the dashboard UI understands. Fields the current backend doesn't provide
// (college, window) are left undefined on purpose — components that rely on
// them will fall back to their own "no data yet" states.
export function normalizeRequestRow(
  raw: DocumentRequestWithRelations,
): RequestRow {
  const paymentMethod =
    raw.payment?.method === "cash" || raw.payment?.method === "online"
      ? raw.payment.method
      : undefined;

  return {
    id: String(raw.id),
    userId: raw.user?.id,
    applicant: raw.user?.fullName ?? "Unknown applicant",
    document: raw.documentType?.name ?? "Unknown document",
    status: raw.status,
    submittedAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    releaseDate: raw.releaseDate,
    claimedAt: raw.claimedAt ? new Date(raw.claimedAt).toISOString() : null,
    purpose: raw.purpose,
    paymentMethod,
    college: undefined, // not in the current schema
    course: undefined,
    section: undefined,
    feeRequired: raw.documentType
      ? Number(raw.documentType.fee) > 0
      : undefined,
  };
}


export type RequestWizardStep = "select" | "details" | "payment";
 
type RequestWizardStepConfig = {
  key: RequestWizardStep;
  label: string;
};
 
export const INITIAL_REQUEST_WIZARD_STEP: RequestWizardStep = "select";
 
export const PROGRESS_MAX_PERCENT = 100;
 
export const REQUEST_WIZARD_STEPS: RequestWizardStepConfig[] = [
  { key: "select", label: "Select Document" },
  { key: "details", label: "Fill Required Details" },
  { key: "payment", label: "Payment & Verification" },
];