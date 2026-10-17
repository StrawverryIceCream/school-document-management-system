import {
  Cog,
  FlaskConical,
  GraduationCap,
  PencilRuler,
  SquareTerminal,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { BannerTone, Tone } from "@/lib/tones";
import { PENDING_STATUS } from "@/lib/windows-header";
import type { DocumentRequestWithRelations } from "@/types";

// Queues at or below this size read as "light" on the card pill
export const LOW_LOAD_MAX_PENDING = 5;
export const MAX_HIGHLIGHTS = 3;

export const HIGHLIGHTS_LABEL = "Queue highlights";
export const NO_PENDING_LABEL = "No pending documents";
const UNKNOWN_DOCUMENT_LABEL = "Other";

export type HouseConfig = {
  name: string;
  established: number | null;
  field: string;
  icon: LucideIcon;
  bannerTone: BannerTone;
  iconTone: Tone;
};

// Keyed by the tile id from the provider's TILES list
export const HOUSE_CONFIGS: Record<string, HouseConfig> = {
  cos: {
    name: "Firetalon",
    established: 1974,
    field: "Natural Sciences",
    icon: FlaskConical,
    bannerTone: "crimson",
    iconTone: "neutral",
  },
  coe: {
    name: "Ironbeaver",
    established: 1982,
    field: "Mechanical & Civil",
    icon: Cog,
    bannerTone: "bronze",
    iconTone: "neutral",
  },
  cafa: {
    name: "Silverwing",
    established: 1989,
    field: "Built Arts & Design",
    icon: PencilRuler,
    bannerTone: "slate",
    iconTone: "neutral",
  },
  cmms: {
    name: "Rosedove",
    established: 1994,
    field: "Business & Governance",
    icon: TrendingUp,
    bannerTone: "mauve",
    iconTone: "neutral",
  },
  cit: {
    name: "Bluemammoth",
    established: 2001,
    field: "Computing & Informatics",
    icon: SquareTerminal,
    bannerTone: "teal",
    iconTone: "neutral",
  },
  cie: {
    name: "Verdantant",
    established: 1978,
    field: "Vocational Pedagogies",
    icon: GraduationCap,
    bannerTone: "forest",
    iconTone: "neutral",
  },
};

// Used when a new tile is added to the provider before it gets a house here
export const DEFAULT_HOUSE: HouseConfig = {
  name: "",
  established: null,
  field: "",
  icon: GraduationCap,
  bannerTone: "slate",
  iconTone: "neutral",
};

export type CollegeTile = {
  title: string;
  description: string;
};

export type CollegeSummary = {
  pendingLabel: string;
  tone: Tone;
  highlights: string[];
};

export function matchesCollege(
  value: string | { code?: string; name?: string } | null | undefined,
  tile: CollegeTile,
): boolean {
  const code = typeof value === "string" ? value : value?.code;
  const name = typeof value === "string" ? value : value?.name;
  const normalizedCode = code?.trim().toLowerCase();
  const normalizedName = name?.trim().toLowerCase();
  if (!normalizedCode && !normalizedName) return false;

  return (
    normalizedCode === tile.title.toLowerCase() ||
    normalizedName === tile.description.toLowerCase()
  );
}

export function getCollegeSummary(
  requests: DocumentRequestWithRelations[],
  tile: CollegeTile,
): CollegeSummary {
  const pending = requests.filter(
    (request) =>
      request.status === PENDING_STATUS &&
      matchesCollege(request.user?.college, tile),
  );

  const counts = new Map<string, number>();
  for (const request of pending) {
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
  if (pending.length === 0) tone = "neutral";
  else if (pending.length <= LOW_LOAD_MAX_PENDING) tone = "emerald";

  return {
    pendingLabel: `${pending.length} Pending ${
      pending.length === 1 ? "Request" : "Requests"
    }`,
    tone,
    highlights,
  };
}
