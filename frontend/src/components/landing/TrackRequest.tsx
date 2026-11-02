import { useState } from "react";
import { Calendar, RefreshCw, Search, ShieldCheck, Store } from "lucide-react";
import { getPublicRequestStatus, type PublicRequestStatus } from "@/api/requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PIPELINE_LABEL,
  STAGES,
  STAGE_TONES,
  TRACK_SEARCH,
  TRACK_SECTION,
} from "@/lib/landing/track-request";
import { BADGE_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types";
import { requestStatusLabels } from "@/types";

// Map request statuses to pipeline stage indices so we can show done/active/upcoming
const STATUS_STAGE_MAP: Partial<Record<RequestStatus, number>> = {
  pending: 0,
  awaiting_payment: 1,
  processing: 2,
  on_hold: 2,
  ready: 3,
  claimed: 4,
};

function getStatusTone(status: RequestStatus) {
  const toneMap: Partial<Record<RequestStatus, string>> = {
    pending: "amber",
    awaiting_payment: "amber",
    processing: "brand",
    on_hold: "rose",
    ready: "emerald",
    claimed: "emerald",
    rejected: "rose",
    cancelled: "neutral",
  };
  return (toneMap[status] ?? "neutral") as keyof typeof TONES;
}

export default function TrackRequest() {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicRequestStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = reference.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getPublicRequestStatus(trimmed);
      setResult(data);
    } catch {
      setError(
        "No document request found for that reference number. Please check your reference code format (e.g. REQ-2026-000018) and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const activeStageIndex =
    result ? (STATUS_STAGE_MAP[result.status] ?? 0) : null;

  return (
    <section
      id={TRACK_SECTION.id}
      aria-labelledby={TRACK_SECTION.headingId}
      className="border-b border-border bg-card py-20"
    >
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-8">
        <div className="space-y-3 text-center">
          <Badge
            className={cn(
              BADGE_BASE,
              "border-transparent",
              TONES.emerald.badge,
            )}
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            {TRACK_SECTION.eyebrow}
          </Badge>
          <h2
            id={TRACK_SECTION.headingId}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            {TRACK_SECTION.title}
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            {TRACK_SECTION.description}
          </p>
        </div>

        <Card className="gap-6 rounded-2xl bg-muted/40 py-6 shadow-sm sm:py-8">
          <CardContent className="space-y-6 sm:px-8">
            <form
              role="search"
              aria-label={TRACK_SEARCH.ariaLabel}
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={handleSubmit}
            >
              <div className="relative flex-1">
                <Label htmlFor={TRACK_SEARCH.inputId} className="sr-only">
                  {TRACK_SEARCH.inputLabel}
                </Label>
                <Search
                  className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id={TRACK_SEARCH.inputId}
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={TRACK_SEARCH.defaultReference}
                  className="h-12 rounded-xl bg-card pl-12 text-base font-medium md:text-base"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading || !reference.trim()}
                className="h-12 gap-2 rounded-xl px-7 text-base font-bold shadow-sm"
              >
                <RefreshCw
                  className={cn("size-5", loading && "animate-spin motion-reduce:animate-none")}
                  aria-hidden="true"
                />
                {loading ? "Searching…" : TRACK_SEARCH.submitLabel}
              </Button>
            </form>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            {result && (
              <Card className="gap-6 py-5 sm:py-6">
                <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {`#${result.referenceNumber}`}
                      </span>
                      <Badge
                        className={cn(
                          BADGE_BASE,
                          "border-transparent font-bold",
                          TONES[getStatusTone(result.status)].badge,
                        )}
                      >
                        {requestStatusLabels[result.status]}
                      </Badge>
                    </div>
                    <CardTitle
                      role="heading"
                      aria-level={3}
                      className="text-xl font-bold"
                    >
                      {result.documentTypeName}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Requester: {result.maskedRequesterName} • Category: {result.category}
                    </CardDescription>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="block text-sm text-muted-foreground">
                      Processing Office
                    </span>
                    <span
                      className={cn(
                        VALUE_BASE,
                        "mt-1.5 flex items-center gap-1.5 text-base leading-snug sm:justify-end",
                        TONES.brand.value,
                      )}
                    >
                      <Store className="size-5" aria-hidden="true" />
                      {result.windowName
                        ? `${result.windowName}${result.windowOffice ? ` (${result.windowOffice.toUpperCase()})` : ""}`
                        : "Office Assignment in Progress"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-base font-bold text-foreground">
                      {PIPELINE_LABEL}
                    </p>
                    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      {STAGES.map(
                        ({ id, label, note, icon: Icon }, index) => {
                          const status =
                            activeStageIndex === null
                              ? "upcoming"
                              : index < activeStageIndex
                                ? "done"
                                : index === activeStageIndex
                                  ? "active"
                                  : "upcoming";
                          const statusText =
                            status === "done"
                              ? "Completed"
                              : status === "active"
                                ? "In progress"
                                : "Upcoming";
                          return (
                            <li
                              key={id}
                              aria-current={
                                status === "active" ? "step" : undefined
                              }
                              className={cn(
                                "space-y-1.5 rounded-lg border p-3",
                                TONES[STAGE_TONES[status]].icon,
                                status === "done" && "border-transparent",
                                status === "active" &&
                                  "border-primary/30 ring-1 ring-primary/20",
                                status === "upcoming" &&
                                  "border-border opacity-60",
                              )}
                            >
                              <div className="flex items-center gap-1.5 text-sm font-bold">
                                <Icon
                                  className={cn(
                                    "size-5 shrink-0",
                                    status === "active" && "animate-spin motion-reduce:animate-none",
                                  )}
                                  aria-hidden="true"
                                />
                                {`${index + 1}. ${label}`}
                                <span className="sr-only">({statusText})</span>
                              </div>
                              <p className="text-sm opacity-80">{note}</p>
                            </li>
                          );
                        },
                      )}
                    </ol>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-2 pt-2 text-sm text-muted-foreground sm:flex-row">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-5" aria-hidden="true" />
                      <span>
                        Estimated Release:{" "}
                        <span className={cn("font-bold", TONES.neutral.value)}>
                          {result.releaseDate
                            ? new Date(result.releaseDate).toLocaleDateString(
                                "en-PH",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : `${result.turnaroundDays} business days`}
                        </span>
                      </span>
                    </span>
                    <span className={cn("font-semibold", TONES.brand.value)}>
                      Bring 1 Valid Institutional ID
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
