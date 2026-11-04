import DocumentGrid from "@/components/requests/new/DocumentGrid";
import NewRequestForm from "@/components/requests/new/NewRequestForm";
import RequestWizardHeader from "@/components/requests/new/RequestWizardHeader";
import DocumentSearchToolbar from "@/components/requests/new/SearchToolbar";
import { useRequestWizard } from "@/hooks/useRequestWizard";
import { useEffect } from "react";

import { useParams } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from "@/provider/SystemSettingsProvider";
import { needsAcademicTermVerification } from "@/lib/term-standing";
import AcademicTermUpdateBanner from "@/components/home/AcademicTermUpdateBanner";

function NewRequest() {
  const { id } = useParams<{ id?: string }>();
  const { setCurrentStep } = useRequestWizard();
  const { user } = useAuth();
  const { activeAcademicTerm } = useSystemSettings();

  useEffect(() => {
    setCurrentStep(id ? "details" : "select");
  }, [id, setCurrentStep]);

  if (
    user?.role === "student" &&
    user?.studentStatus !== "alumni" &&
    needsAcademicTermVerification(user, activeAcademicTerm)
  ) {
    return (
      <div className="h-full overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto max-w-2xl flex flex-col gap-6 pt-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Academic Term Verification Required
                </h2>
                <p className="text-xs text-muted-foreground">
                  Term: {activeAcademicTerm}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              New document requests are locked until your enrollment standing is verified for the active academic term. Please verify your standing below.
            </p>
            <AcademicTermUpdateBanner />
          </div>
        </div>
      </div>
    );
  }

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
