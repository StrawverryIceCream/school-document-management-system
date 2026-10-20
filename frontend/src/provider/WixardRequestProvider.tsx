import { useState } from "react";
import { RequestWizardContext } from "@/context/RequestWizardContext";
import {
  INITIAL_REQUEST_WIZARD_STEP,
  type RequestWizardStep,
} from "@/lib/requests";

export function RequestWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Display-only: the pages push their step here so the header can follow along
  const [currentStep, setCurrentStep] = useState<RequestWizardStep>(
    INITIAL_REQUEST_WIZARD_STEP,
  );

  return (
    <RequestWizardContext.Provider value={{ currentStep, setCurrentStep }}>
      {children}
    </RequestWizardContext.Provider>
  );
}
