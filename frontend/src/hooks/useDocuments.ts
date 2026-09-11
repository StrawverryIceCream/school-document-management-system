import { DocumentContext } from "@/context/DocumentContext";

import { useContext } from "react";

export function useDocuments() {
  const ctx = useContext(DocumentContext);
  if (!ctx)
    throw new Error("useDocuments must be used within DocumentProvider");
  return ctx;
}
