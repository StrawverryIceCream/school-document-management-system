import { useCallback, useEffect, useMemo, useState } from "react";
import { getOffices, type OfficeRecord } from "@/api/offices";
import { SECTORS } from "@/lib/sectors/sectors-config";
import { filterActiveSectors } from "@/lib/sectors/sectors-visibility";
import { useAuth } from "@/hooks/useAuth";
import { SectorsVisibilityContext } from "@/context/SectorsVisibilityContext";

export function SectorsVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [offices, setOffices] = useState<OfficeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadOffices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOffices({ withActiveDocs: true });
      setOffices(data);
    } catch (err) {
      console.error("Failed to load offices for visibility:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadOffices);
  }, [loadOffices]);

  const activeOfficeCodes = useMemo(() => {
    const set = new Set<string>();
    for (const office of offices) {
      if (office.isActive && office.activeDocumentCount > 0) {
        set.add(office.code.toUpperCase());
      }
    }
    return set;
  }, [offices]);

  const isOfficeActiveByCode = useCallback(
    (code: string) => activeOfficeCodes.has(code.toUpperCase()),
    [activeOfficeCodes],
  );

  const visibleSectors = useMemo(() => {
    const allowInactive = isAdmin && showInactive;
    return filterActiveSectors(SECTORS, activeOfficeCodes, allowInactive);
  }, [activeOfficeCodes, isAdmin, showInactive]);

  return (
    <SectorsVisibilityContext.Provider
      value={{
        offices,
        activeOfficeCodes,
        visibleSectors,
        showInactive,
        setShowInactive,
        loading,
        refreshOffices: loadOffices,
        isOfficeActiveByCode,
      }}
    >
      {children}
    </SectorsVisibilityContext.Provider>
  );
}
