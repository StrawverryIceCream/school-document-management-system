import { LogsContext } from "@/context/LogsContext";
import { useContext } from "react";

export function useLogs() {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error("useLogs must be used within a LogsProvider");
  }
  return context;
}