import { useContext, useEffect, useState, type ReactNode } from "react";
import {
  SystemSettingsContext,
  type SystemSettingsContextType,
} from "@/context/SystemSettingsContext";
import { getSystemSettings, updateSystemSettings as apiUpdateSettings } from "@/api/settings";
import { DEFAULT_ACADEMIC_TERM } from "@/lib/term-standing";
import { SYSTEM_VERSION, SYSTEM_VERSION_LABEL } from "@/lib/constants";

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [activeAcademicTerm, setActiveAcademicTerm] = useState<string>(
    DEFAULT_ACADEMIC_TERM,
  );
  const [systemVersion, setSystemVersion] = useState<string>(SYSTEM_VERSION);
  const [systemVersionLabel, setSystemVersionLabel] =
    useState<string>(SYSTEM_VERSION_LABEL);
  const [loading, setLoading] = useState(true);

  async function fetchSettings() {
    try {
      const data = await getSystemSettings();
      if (data.activeAcademicTerm) {
        setActiveAcademicTerm(data.activeAcademicTerm);
      }
      if (data.systemVersion) {
        setSystemVersion(data.systemVersion);
      }
      if (data.systemVersionLabel) {
        setSystemVersionLabel(data.systemVersionLabel);
      }
    } catch (err) {
      console.warn("Failed to fetch system settings, using defaults:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function updateTerm(term: string) {
    const data = await apiUpdateSettings({ activeAcademicTerm: term });
    setActiveAcademicTerm(data.activeAcademicTerm);
    if (data.systemVersion) setSystemVersion(data.systemVersion);
    if (data.systemVersionLabel) setSystemVersionLabel(data.systemVersionLabel);
  }

  async function updateSettings(
    settings: Partial<{
      activeAcademicTerm: string;
      systemVersion: string;
      systemVersionLabel: string;
    }>,
  ) {
    const data = await apiUpdateSettings(settings);
    if (data.activeAcademicTerm) setActiveAcademicTerm(data.activeAcademicTerm);
    if (data.systemVersion) setSystemVersion(data.systemVersion);
    if (data.systemVersionLabel) setSystemVersionLabel(data.systemVersionLabel);
  }

  return (
    <SystemSettingsContext.Provider
      value={{
        activeAcademicTerm,
        systemVersion,
        systemVersionLabel,
        loading,
        updateTerm,
        updateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

const FALLBACK_SETTINGS: SystemSettingsContextType = {
  activeAcademicTerm: DEFAULT_ACADEMIC_TERM,
  systemVersion: SYSTEM_VERSION,
  systemVersionLabel: SYSTEM_VERSION_LABEL,
  loading: false,
  updateTerm: async () => {},
  updateSettings: async () => {},
  refreshSettings: async () => {},
};

export function useSystemSettings(): SystemSettingsContextType {
  const context = useContext(SystemSettingsContext);
  return context || FALLBACK_SETTINGS;
}
