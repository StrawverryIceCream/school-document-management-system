import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import type { Tone } from "@/lib/tones";
import type { RequestStatus } from "@/types";

// Fields the card shows that are not on MyRequest yet. All optional so the
// card still renders before the backend starts sending them.
export type TrackedRequest = MyRequestWithDocumentName & {
  assessedAt?: string | null;
  signedAt?: string | null;
  windowName?: string | null;
  averageWaitMinutes?: number | null;
  isExpress?: boolean;
  requiresSeal?: boolean;
};

type StatusConfig = {
  label: string;
  caption: string;
  tone: Tone;
  completedSteps: number;
  canClaim: boolean;
};

export const STATUS_CONFIGS: Record<RequestStatus, StatusConfig> = {
  pending: {
    label: "Pending Review",
    caption: "Waiting to be assessed",
    tone: "neutral",
    completedSteps: 1,
    canClaim: false,
  },
  processing: {
    label: "Processing",
    caption: "Being prepared by the registrar",
    tone: "amber",
    completedSteps: 2,
    canClaim: false,
  },
  ready: {
    label: "Ready for Claiming",
    caption: "Documents Printed, Embossed & Stamped",
    tone: "emerald",
    completedSteps: 4,
    canClaim: true,
  },
  claimed: {
    label: "Claimed",
    caption: "Documents released to you",
    tone: "neutral",
    completedSteps: 4,
    canClaim: false,
  },
  cancelled: {
    label: "Cancelled",
    caption: "This request was cancelled",
    tone: "neutral",
    completedSteps: 0,
    canClaim: false,
  },
};

export const STEP_LABELS = ["Filed", "Assessed", "Signatures", "Released"] as const;

// Width classes are indexed by completed step count (0 to 4)
export const PROGRESS_WIDTH_CLASSES = [
  "w-0",
  "w-1/4",
  "w-2/4",
  "w-3/4",
  "w-full",
] as const;

export const CLAIM_PERIOD_DAYS = 14;
export const ID_DISPLAY_LENGTH = 11;
export const SKELETON_COUNT = 2;
export const NOW_LABEL = "Now";
export const EMPTY_DATE_LABEL = "—";
export const DATE_LOCALE = "en-PH";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// The shared formatDate returns relative text ("2 days ago"), which does not
// fit the fixed calendar dates this card needs.
export function formatShortDate(value: string | Date): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatClaimPeriod(releaseDate: string | null): string | null {
  if (!releaseDate) return null;

  const start = new Date(releaseDate);
  const end = new Date(start.getTime() + CLAIM_PERIOD_DAYS * MS_PER_DAY);
  const endLabel = new Intl.DateTimeFormat(DATE_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${formatShortDate(start)} – ${endLabel}`;
}

// Order matches STEP_LABELS
export function getStepDates(request: TrackedRequest): string[] {
  const releasedLabel =
    request.status === "ready"
      ? NOW_LABEL
      : request.claimedAt
        ? formatShortDate(request.claimedAt)
        : EMPTY_DATE_LABEL;

  return [
    formatShortDate(request.createdAt),
    request.assessedAt ? formatShortDate(request.assessedAt) : EMPTY_DATE_LABEL,
    request.signedAt ? formatShortDate(request.signedAt) : EMPTY_DATE_LABEL,
    releasedLabel,
  ];
}