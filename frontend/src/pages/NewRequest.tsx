import DocumentGrid from "@/components/new_request/DocumentGrid";
import NewRequestForm from "@/components/new_request/NewRequestForm";
import RequestWizardHeader from "@/components/new_request/RequestWizardHeader";
import DocumentSearchToolbar from "@/components/new_request/SearchToolbar";
import { useRequestWizard } from "@/hooks/useRequestWizard";
import { useEffect } from "react";

import { useParams } from "react-router-dom";

function NewRequest() {
  const { id } = useParams<{ id?: string }>();
  const { setCurrentStep } = useRequestWizard();

  useEffect(() => {
    setCurrentStep(id ? "details" : "select");
  }, [id, setCurrentStep]);

  return id ? (
    <NewRequestForm key={id} />
  ) : (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col ">
        <RequestWizardHeader />

        <div className="flex flex-col gap-1 my-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Available Documents to Request
          </h2>
          <p className="text-sm text-muted-foreground">
            Select an official institutional record to initiate verification and
            seal processing
          </p>
        </div>
        <div className="flex flex-col mb-6">
          <DocumentSearchToolbar />
        </div>
        <DocumentGrid />
      </div>
    </div>
  );
}

export default NewRequest;
