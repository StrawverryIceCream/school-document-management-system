import DocumentGrid from "@/components/new_request/DocumentGrid";
import NewRequestForm from "@/components/new_request/NewRequestForm";
import RequestWizardHeader from "@/components/new_request/RequestWizardHeader";
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
    <NewRequestForm />
  ) : (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <RequestWizardHeader />

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
