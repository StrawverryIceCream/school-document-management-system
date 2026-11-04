import { createContext } from "react";

export interface SystemSettingsContextType {
  activeAcademicTerm: string;
  loading: boolean;
  updateTerm: (term: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const SystemSettingsContext =
  createContext<SystemSettingsContextType | null>(null);
