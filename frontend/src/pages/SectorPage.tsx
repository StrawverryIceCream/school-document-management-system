import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import SectorHeader from "@/components/sectors/SectorHeader";
import SectorDivisionTabs from "@/components/sectors/SectorDivisionTabs";
import OfficeCardsGrid from "@/components/sectors/OfficeCardsGrid";
import OfficeRequestTable from "@/components/sectors/OfficeRequestTable";
import { getSector, getDivision, getOffice } from "@/lib/sectors/sectors-config";
import { getAllRequests } from "@/api/requests";
import type { DocumentRequestWithRelations } from "@/types";

export default function SectorPage() {
  const { sectorId, divisionId, officeId } = useParams();
  const [requests, setRequests] = useState<DocumentRequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sector = sectorId ? getSector(sectorId) : undefined;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAllRequests({ limit: 100 })
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
  }, []);

  if (!sector) {
    return <Navigate to="/sectors/ovpaf/admin-services" replace />;
  }

  // If divisionId missing or invalid, redirect to first division in sector
  const division = divisionId ? getDivision(sector.id, divisionId) : undefined;
  if (!division) {
    return (
      <Navigate
        to={`/sectors/${sector.id}/${sector.divisions[0].id}`}
        replace
      />
    );
  }

  const office = officeId
    ? getOffice(sector.id, division.id, officeId)
    : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <SectorHeader sector={sector} />
      <SectorDivisionTabs
        sectorId={sector.id}
        divisions={sector.divisions}
        activeDivisionId={division.id}
      />
      {office ? (
        <OfficeRequestTable
          sectorId={sector.id}
          divisionId={division.id}
          office={office}
          requests={requests}
          loading={loading}
          error={error}
        />
      ) : (
        <OfficeCardsGrid
          sectorId={sector.id}
          division={division}
          requests={requests}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
