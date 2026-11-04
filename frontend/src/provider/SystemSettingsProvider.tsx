import { useContext, useEffect, useState, type ReactNode } from "react";
import {
  SystemSettingsContext,
  type SystemSettingsContextType,
} from "@/context/SystemSettingsContext";
import { getSystemSettings, updateSystemSettings } from "@/api/settings";
import { DEFAULT_ACADEMIC_TERM } from "@/lib/term-standing";

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [activeAcademicTerm, setActiveAcademicTerm] = useState<string>(
    DEFAULT_ACADEMIC_TERM,
  );
  const [loading, setLoading] = useState(true);

  async function fetchSettings() {
    try {
      const data = await getSystemSettings();
      if (data.activeAcademicTerm) {
        setActiveAcademicTerm(data.activeAcademicTerm);
      }
    } catch (err) {
      console.warn("Failed to fetch system settings, using default term:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function updateTerm(term: string) {
    const data = await updateSystemSettings(term);
    setActiveAcademicTerm(data.activeAcademicTerm);
  }

  return (
    <SystemSettingsContext.Provider
      value={{
        activeAcademicTerm,
        loading,
        updateTerm,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings(): SystemSettingsContextType {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error(
      "useSystemSettings must be used within a SystemSettingsProvider",
    );
  }
  return context;
}
