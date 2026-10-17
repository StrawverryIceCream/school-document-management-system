import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdministrationView } from "@/hooks/useAdministrationView";
import {
  CHIP_LABEL,
  ENTER_SUFFIX,
  getUnitSummary,
  HIGHLIGHTS_LABEL,
  NO_PENDING_LABEL,
  type UnitSummary,
} from "@/lib/administration-unit-cards";
import { ADMINISTRATION_UNITS } from "@/lib/administration-units";
import {
  BADGE_BASE,
  BANNER_TONES,
  ICON_BOX_BASE,
  TONES,
} from "@/lib/tones";
import { cn } from "@/lib/utils";

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

  // A failed fetch would show misleading zeros, so stats are hidden on error
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
          const UnitIcon = unit.icon;
          const hasHighlights = showStats && summary.highlights.length > 0;

          return (
            <Card
              key={unit.id}
              className="h-full gap-0 overflow-hidden rounded-2xl py-0 shadow-sm"
            >
              <div
                className={cn(
                  "relative flex h-72 shrink-0 flex-col justify-between gap-4 p-5",
                  BANNER_TONES[unit.bannerTone],
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
                    {CHIP_LABEL}
                  </Badge>
                  <div
                    className={cn(
                      ICON_BOX_BASE,
                      "size-12",
                      TONES[unit.iconTone].icon,
                    )}
                  >
                    <UnitIcon className="size-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="relative flex justify-center">
                  <p className="rounded-lg bg-black/30 px-8 py-3 text-3xl font-bold uppercase tracking-widest">
                    {unit.code}
                  </p>
                </div>

                <h2
                  title={unit.name}
                  className="relative line-clamp-3 text-2xl font-semibold leading-tight"
                >
                  {unit.name}
                </h2>
              </div>

              <CardContent className="flex flex-1 flex-col gap-4 p-5">
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
                  className="mt-auto w-full text-base"
                  onClick={() => selectUnit(unit.id)}
                >
                  Enter {unit.code} {ENTER_SUFFIX}
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