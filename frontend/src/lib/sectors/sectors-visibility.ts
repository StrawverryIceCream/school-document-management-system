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

export interface UserScopingProfile {
  role?: string;
  office?: string | null;
  officeId?: string | null;
  department?: string | null;
}

export function scopeSectorsForUser(
  sectors: SectorConfig[],
  user: UserScopingProfile | null | undefined,
  offices: Array<{ id: string; code: string; sector: string }> = [],
): SectorConfig[] {
  if (!user || user.role === "admin") {
    return sectors;
  }

  if (user.role !== "staff") {
    return sectors;
  }

  let matchedSectorCode: string | null = null;

  if (user.officeId) {
    const matchedOffice = offices.find((o) => o.id === user.officeId);
    if (matchedOffice?.sector) {
      matchedSectorCode = matchedOffice.sector.toLowerCase();
    }
  }

  if (!matchedSectorCode && user.office) {
    const norm = user.office.toLowerCase();
    if (norm === "registrar" || norm === "our") {
      matchedSectorCode = "ovpaa";
    } else if (norm === "hr" || norm === "hrmo") {
      matchedSectorCode = "ovpaf";
    } else {
      const matchedOffice = offices.find(
        (o) => o.code.toLowerCase() === norm,
      );
      if (matchedOffice?.sector) {
        matchedSectorCode = matchedOffice.sector.toLowerCase();
      }
    }
  }

  if (!matchedSectorCode && user.department) {
    const depUpper = user.department.toUpperCase();
    if (
      depUpper.includes("OVPAF") ||
      depUpper.includes("FINANCE") ||
      depUpper.includes("ADMINISTRATION")
    ) {
      matchedSectorCode = "ovpaf";
    } else if (
      depUpper.includes("OVPAA") ||
      depUpper.includes("ACADEMIC") ||
      depUpper.includes("REGISTRAR")
    ) {
      matchedSectorCode = "ovpaa";
    } else if (depUpper.includes("OVPRE") || depUpper.includes("RESEARCH")) {
      matchedSectorCode = "ovpre";
    } else if (depUpper.includes("OUP") || depUpper.includes("PRESIDENT")) {
      matchedSectorCode = "oup";
    }
  }

  if (!matchedSectorCode) {
    return sectors;
  }

  const scoped = sectors.filter(
    (sec) => sec.id.toLowerCase() === matchedSectorCode,
  );

  return scoped.length > 0 ? scoped : sectors;
}
