import type { DivisionConfig, OfficeConfig, SectorConfig } from "./sectors-config";

export function isOfficeActive(
  office: OfficeConfig,
  activeOfficeCodes: Set<string>,
): boolean {
  return activeOfficeCodes.has(office.code.toUpperCase());
}

export function filterActiveSectors(
  sectors: SectorConfig[],
  activeOfficeCodes: Set<string>,
  showInactive = false,
): SectorConfig[] {
  if (showInactive) return sectors;

  return sectors
    .map((sector) => {
      const activeDivisions = sector.divisions
        .map((division) => {
          const activeOffices = division.offices.filter((office) =>
            isOfficeActive(office, activeOfficeCodes),
          );
          if (activeOffices.length === 0) return null;
          return {
            ...division,
            offices: activeOffices,
          };
        })
        .filter((div): div is DivisionConfig => div !== null);

      if (activeDivisions.length === 0) return null;

      return {
        ...sector,
        divisions: activeDivisions,
      };
    })
    .filter((sec): sec is SectorConfig => sec !== null);
}
