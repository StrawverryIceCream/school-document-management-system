import type { LucideIcon } from "lucide-react";
import { FileText, FileCheck, Files } from "lucide-react";
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

// Office, turnaround, and copy info are not on DocumentType yet, so they are seeded by
// document code until the API provides them
export type DocumentMeta = {
  office: string;
  officeTone: Tone;
  turnaround: string;
  copyLabel: string;
  copyTone: Tone;
  copyIcon: LucideIcon;
};

export const FEE_PENDING_LABEL = "To be confirmed";

export const NO_DESCRIPTION_LABEL = "No description provided";

export const DEFAULT_DOCUMENT_META: DocumentMeta = {
  office: "Registrar",
  officeTone: "neutral",
  turnaround: "To be confirmed",
  copyLabel: "Digital Copy",
  copyTone: "neutral",
  copyIcon: Files,
};

export const DOCUMENT_META_BY_CODE: Record<string, DocumentMeta> = {
  TOR: {
    office: "Academic Registrar",
    officeTone: "rose",
    turnaround: "3–5 working days",
    copyLabel: "Includes 1 Certified Copy",
    copyTone: "emerald",
    copyIcon: FileCheck,
  },
  COE: {
    office: "Student Records",
    officeTone: "sky",
    turnaround: "1–2 working days",
    copyLabel: "Digital & Physical Copy",
    copyTone: "neutral",
    copyIcon: Files,
  },
};

export function getRequestFormPath(documentId: string): string {
  return `/new-request/${documentId}`;
}

export const SEARCH_PLACEHOLDER =
  "Search documents (e.g., Transcript of Records, Certificate of Enrollment)";

export const PROCESSING_WINDOW_LABEL = "Registrar Processing Window";

export const PROCESSING_WINDOW_HOURS = "Mon–Fri, 8:00 AM – 5:00 PM";