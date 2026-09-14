import DocumentGrid from "@/components/new_request/DocumentGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function NewRequest() {

  
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-normal">New Request</h1>
            <p className="text-sm mt-2">Create a new request</p>
          </div>
        </div>
        <Button
          className="w-full h-32 sm:h-40 flex-col gap-2 text-lg"
          variant="outline"
        >
          <Plus className="size-6" />
          <span>New request</span>
        </Button>

        <div className="flex items-start justify-between mb-8 mt-8">
          <h1 className="text-2xl font-bold tracking-normal">
            Available Documents
          </h1>
        </div>
        <DocumentGrid />
      </div>
    </div>
  );
}

export default NewRequest;
