import { ChevronRight, FileStack, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ACTIVE_UNITS_LABEL,
  COLLEGES,
  TOTAL_IN_QUEUE_LABEL,
  WINDOWS_SECTION,
  getQueueTone,
} from "@/lib/landing/college-window";
import { BADGE_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function CollegeWindows() {
  return (
    <section
      id={WINDOWS_SECTION.id}
      aria-labelledby={WINDOWS_SECTION.headingId}
      className="border-b border-border bg-card py-16"
    >
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <Badge
              className={cn(
                BADGE_BASE,
                "rounded-md border-transparent",
                TONES.amber.badge,
              )}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
              {WINDOWS_SECTION.eyebrow}
            </Badge>
            <h2
              id={WINDOWS_SECTION.headingId}
              className="text-4xl font-bold tracking-tight text-foreground"
            >
              {WINDOWS_SECTION.title}
            </h2>
            <p className="max-w-xl text-base text-muted-foreground">
              {WINDOWS_SECTION.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                BADGE_BASE,
                "rounded-lg border-transparent",
                TONES.emerald.badge,
              )}
            >
              <span
                className={cn("size-2 rounded-full", TONES.emerald.dot)}
                aria-hidden="true"
              />
              {ACTIVE_UNITS_LABEL}
            </Badge>
            <Badge
              className={cn(
                BADGE_BASE,
                "rounded-lg border-transparent",
                TONES.neutral.badge,
              )}
            >
              <FileStack className="size-4" aria-hidden="true" />
              {TOTAL_IN_QUEUE_LABEL}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COLLEGES.map((college) => {
            const Icon = college.icon;
            const queueTone = getQueueTone(college.pending);

            return (
              <Card
                key={college.code}
                className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md"
              >
                <CardHeader
                  className={cn("gap-0 p-5", TONES[college.tone].icon)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="rounded-md border-transparent bg-card/70 text-sm font-semibold uppercase tracking-wider text-foreground">
                      {college.house}
                    </Badge>
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="mt-3 text-xl font-bold">
                    {college.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-current opacity-80">
                    {college.tagline}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4 p-5">
                  <dl className="space-y-2.5 text-base">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Current Queue:</dt>
                      <dd>
                        <Badge
                          className={cn(
                            BADGE_BASE,
                            "rounded-md border-transparent font-bold",
                            TONES[queueTone].badge,
                          )}
                        >
                          {`${college.pending} Pending Requests`}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">
                        Active Counters:
                      </dt>
                      <dd
                        className={cn(
                          VALUE_BASE,
                          "text-base leading-snug",
                          TONES.neutral.value,
                        )}
                      >
                        {college.counters}
                      </dd>
                    </div>
                  </dl>

                  <ul className="flex flex-wrap gap-2 pt-1">
                    {college.documents.map(({ label, count }) => (
                      <li key={label}>
                        <Badge
                          className={cn(
                            BADGE_BASE,
                            "rounded-md border-transparent px-2.5 py-0.5 font-mono font-medium",
                            TONES.neutral.badge,
                          )}
                        >
                          {`${label} (${count})`}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <a
                    href={college.queueHref}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full gap-1.5 text-base font-bold",
                    )}
                  >
                    {college.queueLabel}
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </a>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
