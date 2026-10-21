import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import SectorHeader from "@/components/sectors/SectorHeader";
import SectorDivisionTabs from "@/components/sectors/SectorDivisionTabs";
import OfficeCardsGrid from "@/components/sectors/OfficeCardsGrid";
import OfficeRequestTable from "@/components/sectors/OfficeRequestTable";
import InactiveOfficePlaceholder from "@/components/sectors/InactiveOfficePlaceholder";
import { getSector, getDivision, getOffice } from "@/lib/sectors/sectors-config";
import { getAllRequests } from "@/api/requests";
import { useSectorsVisibility } from "@/hooks/useSectorsVisibility";
import type { DocumentRequestWithRelations } from "@/types";

export default function SectorPage() {
  const { sectorId, divisionId, officeId } = useParams();
  const {
    visibleSectors,
    isOfficeActiveByCode,
    showInactive,
    loading: visibilityLoading,
  } = useSectorsVisibility();
  const [requests, setRequests] = useState<DocumentRequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rawSector = sectorId ? getSector(sectorId) : undefined;
  const activeSector = visibleSectors.find((s) => s.id === sectorId);

  useEffect(() => {
    let cancelled = false;

    if (!rawSector?.code) return;

    getAllRequests({
      sector: rawSector.code,
      limit: 100,
    })
      .then((res) => {
        if (!cancelled) {
          setRequests(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load requests",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rawSector?.code]);

  if (visibilityLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Loading workspace...
      </div>
    );
  }

  // Fallback destination if the current unit is completely inactive
  const fallbackUrl =
    visibleSectors.length > 0 && visibleSectors[0].divisions.length > 0
      ? `/sectors/${visibleSectors[0].id}/${visibleSectors[0].divisions[0].id}`
      : "/dashboard";

  if (!rawSector) {
    return <Navigate to={fallbackUrl} replace />;
  }

  // Sector exists in configuration, but has no active documents and admin toggle is off
  if (!activeSector) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
        <SectorHeader sector={rawSector} />
        <InactiveOfficePlaceholder
          title={`${rawSector.name} is Currently Inactive`}
          description="This sector currently has no operational offices supplying documents online."
          fallbackUrl={fallbackUrl}
        />
      </div>
    );
  }

  // If divisionId missing or invalid, redirect to first active division in sector
  const activeDivision = activeSector.divisions.find((d) => d.id === divisionId);
  const rawDivision = divisionId
    ? getDivision(rawSector.id, divisionId)
    : undefined;

  if (!divisionId || !rawDivision) {
    return (
      <Navigate
        to={`/sectors/${activeSector.id}/${activeSector.divisions[0]?.id ?? ""}`}
        replace
      />
    );
  }

  // Division exists, but has no active offices and admin toggle is off
  if (!activeDivision) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
        <SectorHeader sector={activeSector} />
        <SectorDivisionTabs
          sectorId={activeSector.id}
          divisions={activeSector.divisions}
          activeDivisionId={divisionId}
        />
        <InactiveOfficePlaceholder
          title={`${rawDivision.name} is Currently Inactive`}
          description="This division currently has no operational offices supplying documents online."
          fallbackUrl={`/sectors/${activeSector.id}/${activeSector.divisions[0]?.id ?? ""}`}
        />
      </div>
    );
  }

  const rawOffice = officeId
    ? getOffice(activeSector.id, activeDivision.id, officeId)
    : undefined;
  const isOfficeActive = rawOffice
    ? isOfficeActiveByCode(rawOffice.code)
    : false;

  // Office route requested directly, but that office has 0 active documents
  if (officeId && rawOffice && !isOfficeActive && !showInactive) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
        <SectorHeader sector={activeSector} />
        <SectorDivisionTabs
          sectorId={activeSector.id}
          divisions={activeSector.divisions}
          activeDivisionId={activeDivision.id}
        />
        <InactiveOfficePlaceholder
          title={`${rawOffice.name} (${rawOffice.code}) is Currently Inactive`}
          description="This office is currently not issuing documents online. No active document forms are available at this time."
          fallbackUrl={`/sectors/${activeSector.id}/${activeDivision.id}`}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <SectorHeader sector={activeSector} />
      <SectorDivisionTabs
        sectorId={activeSector.id}
        divisions={activeSector.divisions}
        activeDivisionId={activeDivision.id}
      />
      {rawOffice ? (
        <OfficeRequestTable
          sectorId={activeSector.id}
          divisionId={activeDivision.id}
          office={rawOffice}
          requests={requests}
          loading={loading}
          error={error}
        />
      ) : (
        <OfficeCardsGrid
          sectorId={activeSector.id}
          division={activeDivision}
          requests={requests}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
