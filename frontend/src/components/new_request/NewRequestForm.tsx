import { useDocument } from "@/hooks/useDocument";
import type { RequiredFieldValues } from "@/types";
import { useParams } from "react-router-dom";
import DocumentRequestForm from "./DocumentRequestForm";
import NewRequestFormHeader from "./NewRequestFormHeader";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
function NewRequestForm() {
  const { id } = useParams<{ id?: string }>();
  const { document, loading, error } = useDocument(id);

  async function handleSubmit(values: RequiredFieldValues) {
    console.log("Submitted values:", values);
  }

  if (!id) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">No Specified Document</p>
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

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Something went wrong: {error}
        </p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Document unavailable</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <Link
          to="/new-request"
          className="mb-8 inline-flex w-fit items-center gap-2"
        >
          <ChevronLeft />
          <span>Back</span>
        </Link>
        <div className="mx-auto flex flex-col max-w-4xl">
          <NewRequestFormHeader document={document} />
          <DocumentRequestForm document={document} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

export default NewRequestForm;
