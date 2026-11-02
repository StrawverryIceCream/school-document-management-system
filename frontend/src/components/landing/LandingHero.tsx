import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CirclePlus,
  Hash,
  ScanLine,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  HERO_BACKGROUND,
  HERO_DESCRIPTION,
  HERO_HEADING_ID,
  HERO_PILL,
  HERO_PRIMARY_CTA,
  HERO_SECONDARY_CTA,
  HERO_STATS,
  HERO_TITLE,
  SAMPLE_TICKET,
  STAGE_PROGRESS,
  TERMINAL,
  TRACK_FORM,
} from "@/lib/landing/landing-hero";
import { BADGE_BASE, ICON_BOX_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function LandingHero() {
  const { user } = useAuth();
  const [reference, setReference] = useState("");

  const primaryCtaHref = user ? "/new-request" : HERO_PRIMARY_CTA.href;

  return (
    <section
      aria-labelledby={HERO_HEADING_ID}
      className="relative isolate overflow-hidden border-b border-border bg-background pb-20 pt-14 sm:pb-28 sm:pt-20"
    >
      <img
        src={HERO_BACKGROUND.src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r rtl:bg-linear-to-l from-background/95 via-background/85 to-background/40"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 space-y-6 lg:col-span-7">
            <Badge
              variant="outline"
              className={cn(
                BADGE_BASE,
                "gap-2.5 whitespace-normal bg-card px-4 py-2 text-start shadow-sm",
                TONES.brand.value,
              )}
            >
              <span
                className={cn(
                  "size-2 shrink-0 animate-pulse motion-reduce:animate-none rounded-full",
                  TONES[HERO_PILL.dotTone].dot,
                )}
                aria-hidden="true"
              />
              {HERO_PILL.label}
            </Badge>

            <h1
              id={HERO_HEADING_ID}
              className="text-4xl font-extrabold leading-tight tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl"
            >
              {HERO_TITLE.lead}{" "}
              <span className={TONES.brand.value}>{HERO_TITLE.accent}</span>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {HERO_DESCRIPTION}
            </p>

            <div className="flex max-w-xl flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center">
              <a
                href={primaryCtaHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "min-h-14 h-auto py-3.5 gap-2.5 rounded-xl pl-6 pr-7 text-lg font-bold shadow-md",
                )}
              >
                <CirclePlus className="size-6" aria-hidden="true" />
                {HERO_PRIMARY_CTA.label}
              </a>
              <a
                href={HERO_SECONDARY_CTA.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "min-h-14 h-auto py-3.5 gap-2.5 rounded-xl bg-card pl-6 pr-7 text-lg font-semibold shadow-sm",
                )}
              >
                <ScanLine
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                {HERO_SECONDARY_CTA.label}
              </a>
            </div>

            <div className="grid max-w-3xl grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3 sm:gap-6">
              {HERO_STATS.map(({ id, value, caption, tone }) => (
                <div key={id} className="flex flex-col gap-2">
                  <p className={cn(VALUE_BASE, "text-3xl", TONES[tone].value)}>
                    {value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-2 rounded-3xl bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 opacity-75 blur-xl"
              />
              <Card className="relative gap-5 rounded-2xl py-6 shadow-xl">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        ICON_BOX_BASE,
                        "size-11",
                        TONES[TERMINAL.tone].icon,
                      )}
                    >
                      <BadgeCheck className="size-6" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold">
                        {TERMINAL.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {TERMINAL.location}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      BADGE_BASE,
                      "border-transparent",
                      TONES[TERMINAL.tone].badge,
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        TONES[TERMINAL.tone].dot,
                      )}
                      aria-hidden="true"
                    />
                    {TERMINAL.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                          {SAMPLE_TICKET.tokenLabel}
                        </span>
                        <p className="font-mono text-xl font-extrabold text-foreground">
                          {SAMPLE_TICKET.token}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          BADGE_BASE,
                          "rounded-md border-transparent font-mono",
                          TONES[SAMPLE_TICKET.typeTone].badge,
                        )}
                      >
                        {SAMPLE_TICKET.type}
                      </Badge>
                    </div>

                    <dl className="space-y-2.5 text-base">
                      {SAMPLE_TICKET.fields.map(({ label, value, tone }) => (
                        <div
                          key={label}
                          className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 min-w-0"
                        >
                          <dt className="shrink-0 text-muted-foreground">
                            {label}:
                          </dt>
                          <dd
                            className={cn(
                              VALUE_BASE,
                              "text-start sm:text-end text-base leading-snug",
                              TONES[tone].value,
                            )}
                          >
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="space-y-2 pt-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 text-sm font-semibold text-muted-foreground">
                        <span className="min-w-0">
                          {`Stage ${SAMPLE_TICKET.stage.current} of ${SAMPLE_TICKET.stage.total}: ${SAMPLE_TICKET.stage.label}`}
                        </span>
                        <span
                          className={cn(
                            VALUE_BASE,
                            "shrink-0 text-start sm:text-end text-sm",
                            TONES[SAMPLE_TICKET.stage.statusTone].value,
                          )}
                        >
                          {SAMPLE_TICKET.stage.status}
                        </span>
                      </div>
                      <Progress
                        value={STAGE_PROGRESS}
                        aria-label={TRACK_FORM.progressLabel}
                        className="h-2"
                      />
                    </div>
                  </div>

                  <form
                    role="search"
                    aria-label={TRACK_FORM.ariaLabel}
                    className="space-y-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const trimmed = reference.trim();
                      if (!trimmed) return;
                      const trackInput = document.getElementById(
                        "track-request-reference",
                      ) as HTMLInputElement | null;
                      if (trackInput) {
                        trackInput.value = trimmed;
                        trackInput.dispatchEvent(
                          new Event("input", { bubbles: true }),
                        );
                        trackInput.focus({ preventScroll: true });
                      }
                      const trackSection = document.getElementById("track");
                      if (trackSection) {
                        trackSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    <Label
                      htmlFor={TRACK_FORM.inputId}
                      className="text-base font-bold"
                    >
                      {TRACK_FORM.label}
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Hash
                          className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id={TRACK_FORM.inputId}
                          type="text"
                          value={reference}
                          onChange={(event) => setReference(event.target.value)}
                          placeholder={TRACK_FORM.placeholder}
                          className="h-11 ps-10 text-base md:text-base"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="h-11 gap-1.5 px-5 text-base font-bold"
                      >
                        {TRACK_FORM.submitLabel}
                        <ArrowRight className="size-5" aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {TRACK_FORM.hint}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
