import { useMemo } from "react";
import QueueCard from "@/components/shared/QueueCard";
import { useWindowView } from "@/hooks/useWindowView";
import {
  DEFAULT_HOUSE,
  HOUSE_CONFIGS,
  getCollegeSummary,
  type CollegeSummary,
} from "@/lib/windows";

export default function CollegeWindowsCards() {
  const { TILES, requests, loading, error, selectView } = useWindowView();

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        TILES.map((tile) => [tile.id, getCollegeSummary(requests, tile)]),
      ) as Record<string, CollegeSummary>,
    [TILES, requests],
  );

  const showStats = !loading && !error;

  return (
    <section aria-label="Colleges" className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {TILES.map((tile) => {
          const house = HOUSE_CONFIGS[tile.id] ?? DEFAULT_HOUSE;
          const summary = summaries[tile.id];
          const houseName = house.name || tile.title;

          return (
            <QueueCard
              key={tile.id}
              badgeLabel={`House ${houseName}`}
              bannerTone={house.bannerTone}
              iconTone={house.iconTone}
              icon={house.icon}
              code={houseName}
              subtext={
                house.established !== null
                  ? `Est. ${house.established} • ${house.field}`
                  : null
              }
              title={tile.description}
              actionLabel={`Enter ${tile.title} Window`}
              onSelect={() => selectView(tile.id)}
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
