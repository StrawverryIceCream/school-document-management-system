import { useState } from "react";
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
import { ClaimSlipDialog } from "./ClaimSlipDialog";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import {
  formatClaimPeriod,
  formatRequestCardData,
  getCurrentStepInfo,
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
  const [selectedClaimSlipRequest, setSelectedClaimSlipRequest] =
    useState<MyRequestWithDocumentName | null>(null);

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
        const currentStep = getCurrentStepInfo(
          config.completedSteps,
          STEP_LABELS,
          stepDates,
        );

        return (
          <li key={request.id}>
            <Card className="gap-5 sm:gap-6 rounded-2xl border-0 p-4 sm:p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

                <div className="flex shrink-0 flex-col items-start sm:items-end gap-1 rounded-xl bg-muted/60 sm:bg-muted px-4 py-3 sm:px-6 sm:py-4">
                  <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {config.canClaim ? "Pickup Office" : "Processing Office"}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-primary text-left sm:text-right max-w-full sm:max-w-[260px] truncate">
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

              <div className="flex flex-col gap-3 rounded-xl bg-muted/60 sm:bg-muted p-4 sm:px-6 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <span
                    className={cn(
                      "flex items-center gap-2 text-sm sm:text-base font-medium",
                      TONES[config.tone].value,
                    )}
                  >
                    <CircleCheck className="size-4 sm:size-5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{config.caption}</span>
                  </span>
                  <span className="text-xs sm:text-base font-medium text-muted-foreground shrink-0">
                    {progressPercent}% Completed
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  aria-label={`${request.documentName} progress`}
                  className="h-2 sm:h-2.5 w-full overflow-hidden rounded-full bg-background"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      TONES[config.tone].dot,
                      PROGRESS_WIDTH_CLASSES[config.completedSteps],
                    )}
                  />
                </div>
                {/* Mobile view: single clean current-stage callout to avoid text collision */}
                <div className="flex sm:hidden items-center justify-between text-xs text-muted-foreground pt-0.5">
                  <span className="font-semibold text-foreground">
                    Stage {currentStep.stepNumber} of {currentStep.totalSteps}: {currentStep.label}
                  </span>
                  {currentStep.date && currentStep.date !== "—" && (
                    <span className="font-medium text-foreground">{currentStep.date}</span>
                  )}
                </div>
                {/* Tablet / Desktop view: 4-stage grid */}
                <ol className="hidden sm:grid grid-cols-4 text-center text-xs sm:text-sm lg:text-base pt-1">
                  {STEP_LABELS.map((label, index) => (
                    <li
                      key={label}
                      className={cn(
                        "truncate px-1",
                        index < config.completedSteps
                          ? "text-foreground font-medium"
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-1">
                <span className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm lg:text-base text-muted-foreground">
                  <CalendarDays className="size-4 sm:size-5 shrink-0" aria-hidden="true" />
                  {claimPeriod ? (
                    <span>
                      Claim Period:{" "}
                      <span className="font-medium text-foreground">
                        {claimPeriod}
                      </span>
                    </span>
                  ) : (
                    "Claim period not set yet"
                  )}
                </span>

                {config.canClaim && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {request.releasePdfUrl ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs sm:text-sm h-9 sm:h-10 justify-center"
                        asChild
                      >
                        <a
                          href={request.releasePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download PDF for ${request.documentName}`}
                        >
                          <Download className="size-4 shrink-0" aria-hidden="true" />
                          Download PDF
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      className="text-xs sm:text-sm h-9 sm:h-10 justify-center"
                      aria-label={`Present claim slip for ${request.documentName}`}
                      onClick={() => setSelectedClaimSlipRequest(request)}
                    >
                      <QrCode className="size-4 shrink-0" aria-hidden="true" />
                      Present Claim Slip
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </li>
        );
      })}
      <ClaimSlipDialog
        request={selectedClaimSlipRequest}
        open={selectedClaimSlipRequest !== null}
        onOpenChange={(open) => !open && setSelectedClaimSlipRequest(null)}
      />
    </ul>
  );
}
