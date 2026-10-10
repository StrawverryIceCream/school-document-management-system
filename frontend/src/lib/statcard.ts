import type { LucideIcon } from "lucide-react";
import type { Tone } from "./tones";

export type StatTag = {
  label: string;
  // "neutral" renders as plain muted text, the others as a filled badge
  tone: Tone;
  icon?: LucideIcon;
};
