import type { LucideIcon } from "lucide-react";

export type DocumentTone = "rose" | "slate" | "orange" | "sky";

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
  tone: DocumentTone;
};
