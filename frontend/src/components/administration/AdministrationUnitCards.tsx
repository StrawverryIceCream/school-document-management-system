import { useMemo } from "react";
import QueueCard from "@/components/shared/QueueCard";
import { useAdministrationView } from "@/hooks/useAdministrationView";
import {
  CHIP_LABEL,
  ENTER_SUFFIX,
  getUnitSummary,
  type UnitSummary,
} from "@/lib/administration/administration-unit-cards";
import { ADMINISTRATION_UNITS } from "@/lib/administration/administration-units";

export default function AdministrationUnitCards() {
  const { requests, loading, error, selectUnit } = useAdministrationView();

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        ADMINISTRATION_UNITS.map((unit) => [
          unit.id,
          getUnitSummary(requests, unit),
        ]),
      ) as Record<string, UnitSummary>,
    [requests],
  );

  const showStats = !loading && !error;

  return (
    <section aria-label="Administrative offices" className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ADMINISTRATION_UNITS.map((unit) => {
          const summary = summaries[unit.id];

          return (
            <QueueCard
              key={unit.id}
              badgeLabel={CHIP_LABEL}
              bannerTone={unit.bannerTone}
              iconTone={unit.iconTone}
              icon={unit.icon}
              code={unit.code}
              title={unit.name}
              actionLabel={`Enter ${unit.code} ${ENTER_SUFFIX}`}
              onSelect={() => selectUnit(unit.id)}
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