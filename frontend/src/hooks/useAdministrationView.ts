import { useContext } from "react";
import { AdministrationViewContext } from "@/context/AdministrationViewContext.tsx";

export function useAdministrationView() {
  const ctx = useContext(AdministrationViewContext);
  if (!ctx)
    throw new Error(
      "useAdministrationView must be used within AdministrationViewProvider",
    );
  return ctx;
}