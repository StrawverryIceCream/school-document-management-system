import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";
import type { Tone } from "./tones";

export interface DocumentTypeItem {
  id: string;
  title: string;
  description: string;
  price: number;
  turnaround?: string;
  isExpress?: boolean;
  icon?: LucideIcon;
  tone?: Tone;
}

export type InitializedDocumentTypeItem = Omit<
  DocumentTypeItem,
  "icon" | "tone"
> & {
  icon: LucideIcon;
  tone: Tone;
};

type DocumentTypeItemInput = Omit<DocumentTypeItem, "icon" | "tone"> &
  Partial<Pick<DocumentTypeItem, "icon" | "tone">>;

export function initializeDocumentTypeItem(
  document: DocumentTypeItemInput,
): InitializedDocumentTypeItem {
  return {
    ...document,
    isExpress: document.isExpress ?? false,
    icon: document.icon ?? FileText,
    tone: document.tone ?? "neutral",
  };
}
