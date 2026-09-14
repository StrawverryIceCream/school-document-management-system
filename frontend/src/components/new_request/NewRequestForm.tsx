import { useDocument } from "@/hooks/useDocument";
import type { RequiredFieldValues } from "@/types";
import { useParams } from "react-router-dom";
import DocumentRequestForm from "./DocumentRequestForm";

function NewRequestForm() {
  const { id } = useParams<{ id?: string }>();
  const { document, loading, error } = useDocument(id);

  // Placeholder until the submit endpoint exists.
  async function handleSubmit(values: RequiredFieldValues) {
    console.log("Submitted values:", values);
  }

  if (!id) {
    return <p className="p-6 text-destructive">No document specified.</p>;
  }

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading document...</p>;
  }

  if (error) {
    return <p className="p-6 text-destructive">{error}</p>;
  }

  if (!document) {
    return <p className="p-6 text-muted-foreground">Document not found.</p>;
  }

  return <DocumentRequestForm document={document} onSubmit={handleSubmit} />;
}

export default NewRequestForm