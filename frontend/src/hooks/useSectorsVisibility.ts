import { useContext } from "react";
import { SectorsVisibilityContext } from "@/context/SectorsVisibilityContext";

export function useSectorsVisibility() {
  const context = useContext(SectorsVisibilityContext);
  if (!context) {
    throw new Error(
      "useSectorsVisibility must be used within a SectorsVisibilityProvider",
    );
  }
  return context;
}
