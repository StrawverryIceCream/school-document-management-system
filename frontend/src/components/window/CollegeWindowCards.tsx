import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWindowView } from "@/hooks/useWindowView";
import {
  DEFAULT_HOUSE,
  HIGHLIGHTS_LABEL,
  HOUSE_CONFIGS,
  NO_PENDING_LABEL,
  getCollegeSummary,
  type CollegeSummary,
} from "@/lib/college-window-cards";
import {
  BADGE_BASE,
  BANNER_TONES,
  ICON_BOX_BASE,
  TONES,
} from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function CollegeWindowsCards() {
  const { TILES, requests, loading, error, selectView } = useWindowView();

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        TILES.map((tile) => [tile.id, getCollegeSummary(requests, tile)]),
      ) as Record<string, CollegeSummary>,
    [TILES, requests],
  );

  // A failed fetch would show misleading zeros, so stats are hidden on error
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
          const HouseIcon = house.icon;
          const houseName = house.name || tile.title;
          const hasHighlights = showStats && summary.highlights.length > 0;

          return (
            <Card
              key={tile.id}
              className="gap-0 overflow-hidden rounded-2xl py-0 shadow-sm"
            >
              <div
                className={cn(
                  "relative flex min-h-56 flex-col justify-between gap-4 p-5",
                  BANNER_TONES[house.bannerTone],
                )}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1.5px,transparent_1.5px)] bg-[length:16px_16px] opacity-10"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-black/30 px-3 py-1 text-sm uppercase tracking-widest text-white"
                  >
                    House {houseName}
                  </Badge>
                  <div
                    className={cn(
                      ICON_BOX_BASE,
                      "size-12",
                      TONES[house.iconTone].icon,
                    )}
                  >
                    <HouseIcon className="size-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="relative flex flex-col items-center gap-2 text-center">
                  <p className="rounded-lg bg-black/30 px-8 py-3 text-3xl font-bold uppercase tracking-widest">
                    {houseName}
                  </p>
                  {house.established !== null && (
                    <p className="text-base text-white/80">
                      Est. {house.established} • {house.field}
                    </p>
                  )}
                </div>

                <h2 className="relative text-2xl font-semibold">
                  {tile.description}
                </h2>
              </div>

              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex min-h-10 items-center">
                  {loading && <Skeleton className="h-10 w-48 rounded-full" />}
                  {showStats && (
                    <Badge
                      variant="outline"
                      className={cn(
                        BADGE_BASE,
                        "gap-2 whitespace-nowrap px-4 py-2 text-sm",
                        TONES[summary.tone].badge,
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          TONES[summary.tone].dot,
                        )}
                        aria-hidden="true"
                      />
                      {summary.pendingLabel}
                    </Badge>
                  )}
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {HIGHLIGHTS_LABEL}
                  </p>
                  <div className="mt-3 flex min-h-10 flex-wrap items-center gap-2">
                    {loading && <Skeleton className="h-10 w-full" />}
                    {showStats && !hasHighlights && (
                      <p className="text-base text-muted-foreground">
                        {NO_PENDING_LABEL}
                      </p>
                    )}
                    {hasHighlights &&
                      summary.highlights.map((label) => (
                        <Badge
                          key={label}
                          variant="secondary"
                          className="px-3 py-1 text-sm font-normal"
                        >
                          {label}
                        </Badge>
                      ))}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full text-base"
                  onClick={() => selectView(tile.id)}
                >
                  Enter {tile.title} Window
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}