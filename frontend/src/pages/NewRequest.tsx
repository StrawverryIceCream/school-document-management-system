import CreateRequest from "@/components/new_request/CreateRequest";
import DocumentGrid from "@/components/new_request/DocumentGrid";
import NewRequestForm from "@/components/new_request/NewRequestForm";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useParams } from "react-router-dom";

function NewRequest() {
  const { id } = useParams<{ id?: string }>();

  return id ? (
    <NewRequestForm />
  ) : (
    <ScrollArea className="h-full">
      <div className="p-6 sm:p-10">
        <div className="mx-auto flex flex-col">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-normal">
                New Request
              </h1>
              <p className="text-sm mt-2">Create a new request</p>
            </div>
          </div>
          <CreateRequest />

          <div className="flex items-start justify-between mb-8 mt-8">
            <h1 className="text-2xl font-bold tracking-normal">
              Available Documents
            </h1>
          </div>

          <DocumentGrid />
        </div>
      </div>
      <ScrollBar />
    </ScrollArea>
  );
}

export default NewRequest;
