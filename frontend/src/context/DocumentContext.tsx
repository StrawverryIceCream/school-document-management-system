import type { DocumentType } from "@/types";
import { createContext } from "react";

interface DocumentContextType {
  documents: DocumentType[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  isActive: boolean | undefined;
  setIsActive: (value: boolean | undefined) => void;
  refreshDocument: () => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalCount: number;
}

export const DocumentContext = createContext<DocumentContextType | null>(
  null,
);