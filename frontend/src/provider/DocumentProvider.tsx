import { getAllDocument } from "@/api/document";
import { DocumentContext } from "@/context/DocumentContext";
import type { DocumentType } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [debounceSearch, setDebounceSearch] = useState(search);

  const loadDocuments = useCallback(async (): Promise<DocumentType[]> => {
    const response = await getAllDocument({
      search: debounceSearch,
      isActive: isActive,
    });
    return response.data;
  }, [debounceSearch, isActive]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

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
      setError(error instanceof Error ? error.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DocumentContext.Provider
      value={{
        documents,
        loading,
        error,
        search,
        setSearch,
        isActive,
        setIsActive,
        refreshDocument
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
