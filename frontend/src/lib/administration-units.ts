import {
  Building2,
  Compass,
  GraduationCap,
  Landmark,
  Microscope,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { BannerTone, Tone } from "@/lib/tones";
import type { UserRole } from "@/types";

// Students file requests through Windows; Administration serves faculty and staff
export const ADMIN_REQUESTER_ROLES: UserRole[] = ["teacher", "staff"];

export type AdministrationUnit = {
  id: string;
  code: string;
  // Must match the department name stored on users (users.department)
  name: string;
  icon: LucideIcon;
  bannerTone: BannerTone;
  iconTone: Tone;
};

export const ADMINISTRATION_UNITS: AdministrationUnit[] = [
  {
    id: "bor",
    code: "BOR",
    name: "Board of Regents",
    icon: Landmark,
    bannerTone: "crimson",
    iconTone: "neutral",
  },
  {
    id: "op",
    code: "OP",
    name: "Office of the President",
    icon: Building2,
    bannerTone: "bronze",
    iconTone: "neutral",
  },
  {
    id: "vpre",
    code: "VPRE",
    name: "Vice President - Research and Extension",
    icon: Microscope,
    bannerTone: "slate",
    iconTone: "neutral",
  },
  {
    id: "vpaf",
    code: "VPAF",
    name: "Vice President - Administration and Finance",
    icon: Wallet,
    bannerTone: "mauve",
    iconTone: "neutral",
  },
  {
    id: "vpaa",
    code: "VPAA",
    name: "Vice President - Academic Affairs",
    icon: GraduationCap,
    bannerTone: "teal",
    iconTone: "neutral",
  },
  {
    id: "vppdsc",
    code: "VPPDSC",
    name: "Vice President - Planning, Development & Special Concerns",
    icon: Compass,
    bannerTone: "forest",
    iconTone: "neutral",
  },
];

// Department text is entered by users, so dash style, spacing, and "&" vs "and" can differ
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/&/g, "and")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesUnit(
  value: string | null | undefined,
  unit: AdministrationUnit,
): boolean {
  if (!value) return false;

  const normalized = normalize(value);
  return (
    normalized === normalize(unit.name) || normalized === normalize(unit.code)
  );
}