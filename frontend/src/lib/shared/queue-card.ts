import type { BannerTone, Tone } from "@/lib/tones";
import type { DocumentRequestWithRelations } from "@/types";
import type { LucideIcon } from "lucide-react";

export const LOW_LOAD_MAX_PENDING = 5;
export const MAX_HIGHLIGHTS = 3;
export const HIGHLIGHTS_LABEL = "Queue highlights";
export const NO_PENDING_LABEL = "No pending documents";
const UNKNOWN_DOCUMENT_LABEL = "Other";

export type QueueSummary = {
  pendingLabel: string;
  tone: Tone;
  highlights: string[];
};

export type QueueCardData = {
  id: string;
  badgeLabel: string;
  bannerTone: BannerTone;
  iconTone: Tone;
  icon: LucideIcon;
  code: string;
  subtext?: string | null;
  title: string;
  actionLabel: string;
  onSelect: () => void;
};

export function buildQueueSummary(
  pendingRequests: DocumentRequestWithRelations[],
): QueueSummary {
  const counts = new Map<string, number>();
  for (const request of pendingRequests) {
    const label =
      request.documentType?.code ??
      request.documentType?.name ??
      UNKNOWN_DOCUMENT_LABEL;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const highlights = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_HIGHLIGHTS)
    .map(([label, count]) => `${label} (${count})`);

  let tone: Tone = "amber";
  if (pendingRequests.length === 0) tone = "neutral";
  else if (pendingRequests.length <= LOW_LOAD_MAX_PENDING) tone = "emerald";

  return {
    pendingLabel: `${pendingRequests.length} Pending ${
      pendingRequests.length === 1 ? "Request" : "Requests"
    }`,
    tone,
    highlights,
  };
}
