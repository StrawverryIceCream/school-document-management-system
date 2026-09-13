import { getAllDocument } from "@/api/document";
import { DocumentContext } from "@/context/DocumentContext";
import type { DocumentType } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async (): Promise<DocumentType[]> => {
    const response = await getAllDocument();
    return response.data;
  }, []);

  useEffect(() => {
    loadDocuments()
      .then(setDocuments)
      .catch((error) => {
        console.error("Failed to load documents:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load documents",
        );
      })
      .finally(() => setLoading(false));
  }, [loadDocuments]);

  async function refreshDocument() {
    setLoading(true);
    try {
      const data = await loadDocuments();
      setDocuments(data);
      setError(null);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DocumentContext.Provider
      value={{ documents, loading, error, refreshDocument }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
