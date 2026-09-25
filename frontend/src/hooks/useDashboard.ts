import { DashboardContext } from "@/context/DashboardContext";
import { useContext } from "react";

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}