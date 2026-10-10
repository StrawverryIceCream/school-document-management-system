import type { LucideIcon } from "lucide-react";

export type StatTone = "neutral" | "amber" | "emerald";

export type StatTag = {
  label: string;
  // "neutral" renders as plain muted text, the others as a filled badge
  tone: StatTone;
  icon?: LucideIcon;
};

export const ICON_BOX_STYLES: Record<StatTone, string> = {
  neutral: "bg-stone-200 text-stone-700",
  amber: "bg-amber-100 text-amber-900",
  emerald: "bg-emerald-100 text-emerald-800",
};

export const VALUE_STYLES: Record<StatTone, string> = {
  neutral: "text-foreground",
  amber: "text-foreground",
  emerald: "text-teal-700",
};

export const TAG_BADGE_STYLES: Record<Exclude<StatTone, "neutral">, string> = {
  amber: "bg-amber-100 text-amber-900",
  emerald: "bg-emerald-100 text-emerald-800",
};