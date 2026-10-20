import {
  Cog,
  FlaskConical,
  GraduationCap,
  PencilRuler,
  SquareTerminal,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  buildQueueSummary,
  type QueueSummary,
} from "@/lib/shared/queue-card";
import type { BannerTone, Tone } from "@/lib/tones";
import { PENDING_STATUS } from "./header";
import type { DocumentRequestWithRelations } from "@/types";

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

export type CollegeSummary = QueueSummary;

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
): QueueSummary {
  const pending = requests.filter(
    (request) =>
      request.status === PENDING_STATUS &&
      matchesCollege(request.user?.college, tile),
  );
  return buildQueueSummary(pending);
}
