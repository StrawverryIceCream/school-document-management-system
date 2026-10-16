import { useEffect, useState } from "react";
import { ChevronRight, FileStack, LayoutGrid } from "lucide-react";
import { getAllColleges } from "@/api/colleges";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { WINDOWS_SECTION } from "@/lib/landing/college-window";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { College } from "@/types";

export default function CollegeWindows() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllColleges({ isActive: true, limit: 50 })
      .then((res) => setColleges(res.data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const activeUnitsLabel = `${colleges.length} Academic Units Active`;

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
              {loading ? "Loading…" : activeUnitsLabel}
            </Badge>
            <Badge
              className={cn(
                BADGE_BASE,
                "rounded-lg border-transparent",
                TONES.neutral.badge,
              )}
            >
              <FileStack className="size-4" aria-hidden="true" />
              Registrar Document Services
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="h-48 animate-pulse gap-0 overflow-hidden bg-muted py-0"
              />
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            No active colleges found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college, index) => {
              // Cycle through visual tones since the API has no tone field
              const toneKeys = [
                "brand",
                "amber",
                "neutral",
                "rose",
                "sky",
                "emerald",
              ] as const;
              const tone = toneKeys[index % toneKeys.length];

              return (
                <Card
                  key={college.id}
                  className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md"
                >
                  <CardHeader className={cn("gap-0 p-5", TONES[tone].icon)}>
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="rounded-md border-transparent bg-card/70 text-sm font-semibold uppercase tracking-wider text-foreground">
                        {college.code}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-xl font-bold">
                      {college.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-current opacity-80">
                      Est. code: {college.code}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 p-5">
                    <dl className="space-y-2.5 text-base">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Status:</dt>
                        <dd>
                          <Badge
                            className={cn(
                              BADGE_BASE,
                              "rounded-md border-transparent font-bold",
                              college.isActive
                                ? TONES.emerald.badge
                                : TONES.neutral.badge,
                            )}
                          >
                            {college.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <a
                      href="#login"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "w-full gap-1.5 text-base font-bold",
                      )}
                    >
                      View {college.code} Queue
                      <ChevronRight className="size-5" aria-hidden="true" />
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
