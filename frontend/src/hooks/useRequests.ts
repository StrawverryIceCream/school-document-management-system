import { RequestContext } from "@/context/RequestContext";
import { useContext } from "react";

export function useRequests() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequests must be used within RequestProvider");
  }

  return context;
}
