import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import QueueCard from "@/components/shared/QueueCard";
import { getOfficeSummary } from "@/lib/sectors/sector-matching";
import type { DivisionConfig } from "@/lib/sectors/sectors-config";
import type { DocumentRequestWithRelations } from "@/types";

interface OfficeCardsGridProps {
  sectorId: string;
  division: DivisionConfig;
  requests: DocumentRequestWithRelations[];
  loading: boolean;
  error: string | null;
}

export default function OfficeCardsGrid({
  sectorId,
  division,
  requests,
  loading,
  error,
}: OfficeCardsGridProps) {
  const navigate = useNavigate();

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        division.offices.map((office) => [
          office.id,
          getOfficeSummary(requests, office),
        ]),
      ),
    [division.offices, requests],
  );

  const showStats = !loading && !error;

  return (
    <section aria-label={`${division.name} offices`} className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {division.offices.map((office) => {
          const summary = summaries[office.id];

          return (
            <QueueCard
              key={office.id}
              badgeLabel={office.code}
              bannerTone={office.bannerTone}
              iconTone={office.iconTone}
              icon={office.icon}
              code={office.code}
              subtext={office.name}
              title={office.description}
              actionLabel={`Enter ${office.code} Queue`}
              onSelect={() =>
                navigate(`/sectors/${sectorId}/${division.id}/${office.id}`)
              }
              summary={summary}
              loading={loading}
              showStats={showStats}
            />
          );
        })}
      </div>
    </section>
  );
}
