import {
  CalendarDays,
  CircleCheck,
  Clock,
  Download,
  QrCode,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyRequest } from "@/hooks/useMyRequest";
import {
  formatClaimPeriod,
  formatRequestCardData,
  getStepDates,
  PROGRESS_WIDTH_CLASSES,
  SKELETON_COUNT,
  STATUS_CONFIGS,
  STEP_LABELS,
} from "@/lib/requests";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function MyRequestList() {
  const { filteredRequests, loading, error } = useMyRequest();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-base text-destructive">{error}</p>;
  }

  if (filteredRequests.length === 0) {
    return (
      <p className="py-12 text-center text-base text-muted-foreground">
        No requests found.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {filteredRequests.map((request) => {
        const config = STATUS_CONFIGS[request.status];
        const stepDates = getStepDates(request);
        const claimPeriod = formatClaimPeriod(request.releaseDate);
        const cardData = formatRequestCardData(request);
        const progressPercent = Math.round(
          (config.completedSteps / STEP_LABELS.length) * 100,
        );

        return (
          <li key={request.id}>
            <Card className="gap-6 rounded-2xl border-0 px-8 py-8 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        BADGE_BASE,
                        "gap-2 px-3 py-1 text-sm",
                        TONES[config.tone].badge,
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          TONES[config.tone].dot,
                        )}
                        aria-hidden="true"
                      />
                      {config.label}
                    </Badge>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {cardData.referenceNumber}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        BADGE_BASE,
                        cardData.isPaid
                          ? TONES["emerald"].badge
                          : cardData.amountNumber > 0
                            ? TONES["amber"].badge
                            : TONES["neutral"].badge,
                      )}
                    >
                      {cardData.paymentStatusText}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {request.documentName}
                  </h3>
                  {request.purpose && (
                    <p className="text-base text-muted-foreground">
                      Purpose:{" "}
                      <span className="font-medium text-foreground">
                        {request.purpose}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 rounded-xl bg-muted px-6 py-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {config.canClaim ? "Pickup Office" : "Processing Office"}
                  </span>
                  <span className="text-base font-bold text-primary text-right max-w-[260px] truncate">
                    {cardData.officeName}
                  </span>
                  {request.releaseDate && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden="true" />
                      Target: {request.releaseDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl bg-muted px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={cn(
                      "flex items-center gap-2 text-base font-medium",
                      TONES[config.tone].value,
                    )}
                  >
                    <CircleCheck className="size-5" aria-hidden="true" />
                    {config.caption}
                  </span>
                  <span className="text-base font-medium text-muted-foreground">
                    {progressPercent}% Completed
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  aria-label={`${request.documentName} progress`}
                  className="h-2.5 w-full overflow-hidden rounded-full bg-background"
                >
                  <div
                    className={cn(
                      "h-full rounded-full",
                      TONES[config.tone].dot,
                      PROGRESS_WIDTH_CLASSES[config.completedSteps],
                    )}
                  />
                </div>
                <ol className="grid grid-cols-4 text-center text-base">
                  {STEP_LABELS.map((label, index) => (
                    <li
                      key={label}
                      className={cn(
                        index < config.completedSteps
                          ? "text-foreground"
                          : "text-muted-foreground",
                        index === STEP_LABELS.length - 1 &&
                          request.status === "ready" &&
                          cn("font-semibold", TONES[config.tone].value),
                      )}
                    >
                      {label} ({stepDates[index]})
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-3 text-base text-muted-foreground">
                  <CalendarDays className="size-5" aria-hidden="true" />
                  {claimPeriod ? (
                    <>
                      Claim Period:{" "}
                      <span className="font-medium text-foreground">
                        {claimPeriod}
                      </span>
                    </>
                  ) : (
                    "Claim period not set yet"
                  )}
                </span>

                {config.canClaim && (
                  <div className="flex items-center gap-3">
                    {request.releasePdfUrl ? (
                      <Button
                        variant="secondary"
                        size="lg"
                        className="text-base"
                        asChild
                      >
                        <a
                          href={request.releasePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download PDF for ${request.documentName}`}
                        >
                          <Download className="size-5" aria-hidden="true" />
                          Download PDF
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      size="lg"
                      className="text-base"
                      aria-label={`Present claim slip for ${request.documentName}`}
                    >
                      <QrCode className="size-5" aria-hidden="true" />
                      Present Claim Slip
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
