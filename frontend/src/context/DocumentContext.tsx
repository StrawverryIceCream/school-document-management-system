import type { DocumentType } from "@/types";
import { createContext } from "react";

interface DocumentContextType {
  documents : DocumentType[];
  loading : boolean;
  error : string | null;
  refreshDocument: () => Promise<void>;
}

export const DocumentContext = createContext<DocumentContextType | null>(null)