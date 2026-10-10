import type { LucideIcon } from "lucide-react";
import type { IconTone } from "./icon-tones";

export type DocumentTypeItem = {
  id: string;
  title: string;
  description: string;
  // Peso amount; formatted at render time so the API stays currency-agnostic
  price: number;
  turnaround: string;
  // Express documents get a lightning icon instead of a clock
  isExpress: boolean;
  icon: LucideIcon;
  tone: IconTone;
};
