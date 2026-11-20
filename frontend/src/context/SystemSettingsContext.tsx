import { createContext } from "react";

export interface SystemSettingsContextType {
  activeAcademicTerm: string;
  systemVersion: string;
  systemVersionLabel: string;
  loginTwoFactorEnabled: boolean;
  loading: boolean;
  updateTerm: (term: string) => Promise<void>;
  updateTwoFactor: (enabled: boolean) => Promise<void>;
  updateSettings: (settings: Partial<{
    activeAcademicTerm: string;
    systemVersion: string;
    systemVersionLabel: string;
    loginTwoFactorEnabled: boolean;
  }>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const SystemSettingsContext =
  createContext<SystemSettingsContextType | null>(null);
