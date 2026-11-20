import type { LucideIcon } from "lucide-react";
import { FileText, FileCheck, Files } from "lucide-react";
import type { Tone } from "@/lib/tones";

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

export interface DocumentOfficeTarget {
  code: string;
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeRecord?: { id?: string | null; code?: string | null } | null;
}

export interface StaffOfficeViewer {
  role: "student" | "teacher" | "admin" | "staff";
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
  officeRecord?: { id?: string | null; code?: string | null } | null;
}

const DOC_PREFIX_OFFICE_ALIASES: Record<string, string> = {
  TLO: "TLO-ITSO",
};

function legacyOfficeToCode(office?: "registrar" | "hr" | null): string | null {
  if (office === "hr") return "HRMO";
  if (office === "registrar") return "OUR";
  return null;
}

export function resolveDocumentOfficeCode(doc: DocumentOfficeTarget): string | null {
  const recordCode = doc.officeRecord?.code?.trim().toUpperCase();
  if (recordCode) return recordCode;

  const trimmedCode = doc.code?.trim().toUpperCase() ?? "";
  if (trimmedCode.startsWith("TLO-ITSO-")) return "TLO-ITSO";
  const dashIdx = trimmedCode.indexOf("-");
  if (dashIdx > 0) {
    const prefix = trimmedCode.slice(0, dashIdx).trim();
    if (prefix) return DOC_PREFIX_OFFICE_ALIASES[prefix] ?? prefix;
  }

  return legacyOfficeToCode(doc.office);
}

export function resolveStaffOfficeCode(
  user: Pick<StaffOfficeViewer, "office" | "officeRecord"> | null | undefined,
): string | null {
  if (!user) return null;
  const recordCode = user.officeRecord?.code?.trim().toUpperCase();
  if (recordCode) return recordCode;
  return legacyOfficeToCode(user.office);
}

export function isDocumentInStaffOffice(
  doc: DocumentOfficeTarget,
  user: StaffOfficeViewer | null | undefined,
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "staff") return false;

  const docOfficeId = (doc.officeId ?? doc.officeRecord?.id)?.trim() || null;
  const userOfficeId = (user.officeId ?? user.officeRecord?.id)?.trim() || null;
  if (docOfficeId && userOfficeId) {
    return docOfficeId === userOfficeId;
  }

  const docCode = resolveDocumentOfficeCode(doc);
  const userCode = resolveStaffOfficeCode(user);
  return Boolean(docCode && userCode && docCode === userCode);
}

export function filterDocumentsForManager<T extends DocumentOfficeTarget>(
  documents: T[],
  user: StaffOfficeViewer | null | undefined,
): T[] {
  if (!user) return [];
  if (user.role === "admin") return documents;
  if (user.role !== "staff") return [];
  return documents.filter((doc) => isDocumentInStaffOffice(doc, user));
}
