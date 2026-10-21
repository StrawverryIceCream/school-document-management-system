import type { DocumentRequestWithRelations, RequestStatus } from "@/types";
import type { RequestRow } from "@/context/DashboardContext";
import {
  Ban,
  Check,
  Clock,
  CreditCard,
  ListChecks,
  Pause,
  PackageCheck,
  XCircle,
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
  awaiting_payment:
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  processing:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  on_hold:
    "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-500/10 dark:text-stone-400 dark:border-stone-500/20",
  ready:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  claimed:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  rejected:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
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
    awaiting_payment: {
      label: "Awaiting Payment",
      icon: CreditCard,
      badgeClassName: "bg-purple-100 text-purple-900",
      dotClassName: "bg-purple-600",
    },
    processing: {
      label: "Processing",
      icon: ListChecks,
      badgeClassName: "bg-amber-100 text-amber-900",
      dotClassName: "bg-amber-700",
    },
    on_hold: {
      label: "On Hold",
      icon: Pause,
      badgeClassName: "bg-stone-200 text-stone-800",
      dotClassName: "bg-stone-500",
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
    rejected: {
      label: "Rejected",
      icon: XCircle,
      badgeClassName: "bg-rose-100 text-rose-900",
      dotClassName: "bg-rose-600",
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
  awaiting_payment: "Awaiting Payment",
  processing: "Processing",
  on_hold: "On Hold",
  ready: "Ready to Claim",
  claimed: "Claimed",
  rejected: "Rejected",
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
  const validPayment =
    raw.payments?.find((p) => p.status === "verified") ??
    raw.payments?.find((p) => p.status === "pending") ??
    raw.payments?.[0];
  const paymentMethod =
    validPayment?.method === "cash"
      ? "cash"
      : validPayment?.method
        ? "online"
        : undefined;

  const rawForm =
    raw.formData && typeof raw.formData === "object"
      ? (raw.formData as Record<string, unknown>)
      : undefined;

  const userCollege = raw.user?.college?.code ?? raw.user?.college?.name;
  const formCollege =
    typeof rawForm?.college === "string" ? rawForm.college : undefined;
  const college = userCollege ?? formCollege ?? undefined;
  const collegeName =
    raw.user?.college?.name ??
    (typeof rawForm?.collegeName === "string" ? rawForm.collegeName : undefined);
  const course =
    raw.user?.department ??
    (typeof rawForm?.course === "string" ? rawForm.course : undefined);
  const section =
    typeof rawForm?.section === "string" ? rawForm.section : undefined;
  const windowId =
    raw.window?.name ?? (raw.windowId ? String(raw.windowId) : undefined);

  const docCode = raw.documentTypeCode ?? raw.documentType?.code;
  const officeCode =
    raw.documentType?.officeRecord?.code ??
    (docCode?.includes("-")
      ? docCode.split("-")[0]
      : raw.documentType?.office);
  const officeName =
    raw.documentType?.officeRecord?.name ??
    (raw.documentType?.office
      ? raw.documentType.office.toUpperCase()
      : undefined);
  const sector = raw.documentType?.officeRecord?.sector ?? undefined;
  const officeId =
    raw.documentType?.officeRecord?.id ??
    raw.documentType?.officeId ??
    undefined;

  return {
    id: String(raw.id),
    referenceNumber: raw.referenceNumber,
    userId: raw.user?.id,
    applicant: raw.user?.fullName ?? "Unknown applicant",
    studentId: raw.user?.studentId,
    document:
      raw.documentType?.name ?? raw.documentTypeName ?? "Unknown document",
    documentTypeCode: raw.documentTypeCode ?? raw.documentType?.code,
    officeId: officeId ? String(officeId) : undefined,
    officeCode,
    officeName,
    sector,
    status: raw.status,
    submittedAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    releaseDate: raw.releaseDate,
    claimedAt: raw.claimedAt ? new Date(raw.claimedAt).toISOString() : null,
    purpose: raw.purpose,
    amountDue: raw.amountDue ?? String(raw.documentType?.fee ?? "0"),
    processingDays: raw.documentType?.processingDays ?? raw.turnaroundDays ?? 3,
    paymentMethod,
    college,
    collegeName,
    course,
    section,
    windowId,
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
