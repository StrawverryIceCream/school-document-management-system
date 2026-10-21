import { createContext } from "react";
import type { OfficeRecord } from "@/api/offices";
import type { SectorConfig } from "@/lib/sectors/sectors-config";

export interface SectorsVisibilityContextType {
  offices: OfficeRecord[];
  activeOfficeCodes: Set<string>;
  visibleSectors: SectorConfig[];
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
  loading: boolean;
  refreshOffices: () => Promise<void>;
  isOfficeActiveByCode: (code: string) => boolean;
}

export const SectorsVisibilityContext =
  createContext<SectorsVisibilityContextType | null>(null);

