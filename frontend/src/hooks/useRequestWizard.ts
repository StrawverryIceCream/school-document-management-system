import { useContext } from "react";
import { RequestWizardContext } from "@/context/RequestWizardContext";
 
export function useRequestWizard() {
  const ctx = useContext(RequestWizardContext);
  if (!ctx) throw new Error("useRequestWizard must be used within RequestWizardProvider");
  return ctx;
}