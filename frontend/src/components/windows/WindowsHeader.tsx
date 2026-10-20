import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWindowView } from "@/hooks/useWindowView";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import {
  HEADER_COPY,
  HEADER_PILLS,
  PENDING_STATUS,
  type HeaderPillKey,
} from "@/lib/windows";

export default function WindowsHeader() {
  const { TILES, requests, loading, error } = useWindowView();

  const counts: Record<HeaderPillKey, number> = {
    units: TILES.length,
    pending: requests.filter((request) => request.status === PENDING_STATUS)
      .length,
  };

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-foreground">
          {HEADER_COPY.eyebrow}
          <span
            className={cn("size-2 rounded-full", TONES.amber.dot)}
            aria-hidden="true"
          />
          <span className="font-normal normal-case tracking-normal text-muted-foreground">
            {HEADER_COPY.eyebrowNote}
          </span>
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          {HEADER_COPY.title}
        </h1>
        <p className="text-base text-muted-foreground">
          {HEADER_COPY.description}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:items-end">
        {HEADER_PILLS.map((pill) => {
          if (pill.needsRequests && loading) {
            return (
              <Skeleton key={pill.key} className="h-10 w-64 rounded-full" />
            );
          }
          // A failed fetch would show a misleading 0, so the count is hidden
          if (pill.needsRequests && error) return null;

          const Icon = pill.icon;

          return (
            <Badge
              key={pill.key}
              variant="outline"
              className={cn(
                BADGE_BASE,
                "gap-2 whitespace-nowrap px-4 py-2 text-sm",
                TONES[pill.tone].badge,
              )}
            >
              {Icon ? (
                <Icon className="size-4" aria-hidden="true" />
              ) : (
                <span
                  className={cn("size-2 rounded-full", TONES[pill.tone].dot)}
                  aria-hidden="true"
                />
              )}
              {counts[pill.key]} {pill.label}
            </Badge>
          );
        })}
      </div>
    </header>
  );
}