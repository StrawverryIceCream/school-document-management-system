import type { DocumentType } from "@/types";
import { createContext } from "react";

interface DocumentContextType {
  documents: DocumentType[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (search: string) => void;
  isActive: boolean | undefined;
  setIsActive: (isActive: boolean | undefined) => void;
  refreshDocument: () => Promise<void>;
}

export const DocumentContext = createContext<DocumentContextType | null>(null);