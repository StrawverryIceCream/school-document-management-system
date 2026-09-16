import { useDocument } from "@/hooks/useDocument";

import { useParams } from "react-router-dom";
import DocumentRequestForm from "./DocumentRequestForm";
import NewRequestFormHeader from "./NewRequestFormHeader";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import PayRequestDialog from "./PayRequestDialog";
import { ScrollArea } from "../ui/scroll-area";
function NewRequestForm() {
  const { id } = useParams<{ id?: string }>();
  const { document, loading, error } = useDocument(id);

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
        <div className="mb-8">
          <Link
            to="/new-request"
            className="inline-flex w-fit items-center gap-2"
          >
            <ChevronLeft />
            <span>Back</span>
          </Link>
          <div className="ml-12 mt-4">
            <h1 className="text-3xl font-bold tracking-normal">Step 2</h1>
            <p className="text-sm mt-2">Fill in the required field</p>
          </div>
        </div>

        {/* this wrapper claims remaining height, Card sits inside it as the fixed frame */}
        <div className="w-full max-w-4xl mx-auto flex-1 min-h-0">
          <Card className="h-full p-6 shadow-sm flex flex-col">
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="flex flex-col pr-8">
                  <NewRequestFormHeader document={document} />
                  <DocumentRequestForm document={document} />
                  <PayRequestDialog />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default NewRequestForm;
