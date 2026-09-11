import { DocumentContext } from "@/context/DocumentContext";
import type { DocumentType } from "@/types";
import { useState } from "react";

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  async function refreshDocument() {
    return;
  }

  return (
    <DocumentContext.Provider
      value={{ documents, loading, error, refreshDocument }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
