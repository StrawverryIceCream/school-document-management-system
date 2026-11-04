import { createContext } from "react";

export interface SystemSettingsContextType {
  activeAcademicTerm: string;
  systemVersion: string;
  systemVersionLabel: string;
  loading: boolean;
  updateTerm: (term: string) => Promise<void>;
  updateSettings: (settings: Partial<{
    activeAcademicTerm: string;
    systemVersion: string;
    systemVersionLabel: string;
  }>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const SystemSettingsContext =
  createContext<SystemSettingsContextType | null>(null);
