import { useDocuments } from "@/hooks/useDocuments";
import DocumentCard from "./DocumentCard";

function DocumentGrid() {
  const { documents, loading, error } = useDocuments();
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Something went wrong: {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading Documents...</p>
      </div>
    );
  }
  return (
    <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard document={document} />
      ))}
    </div>
  );
}

export default DocumentGrid;
