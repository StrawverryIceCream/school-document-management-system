import { createContext } from "react";
import type { RequestWizardStep } from "@/lib/requests";

interface RequestWizardContextType {
  currentStep: RequestWizardStep;
  setCurrentStep: (step: RequestWizardStep) => void;
}

export const RequestWizardContext =
  createContext<RequestWizardContextType | null>(null);
