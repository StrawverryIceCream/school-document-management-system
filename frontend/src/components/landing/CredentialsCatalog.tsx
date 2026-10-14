import { Info, Star } from "lucide-react";
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
  CATALOG_CALLOUT,
  CATALOG_SECTION,
  CREDENTIALS,
  FEATURED_LABEL,
  REQUEST_LABEL,
} from "@/lib/landing/credentials-catalog";
import { BADGE_BASE, ICON_BOX_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function CredentialsCatalog() {
  return (
    <section
      id={CATALOG_SECTION.id}
      aria-labelledby={CATALOG_SECTION.headingId}
      className="border-b border-border bg-background py-20"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <Badge
            className={cn(
              BADGE_BASE,
              "border-transparent font-bold uppercase tracking-wider",
              TONES.brand.badge,
            )}
          >
            {CATALOG_SECTION.eyebrow}
          </Badge>
          <h2
            id={CATALOG_SECTION.headingId}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            {CATALOG_SECTION.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {CATALOG_SECTION.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CREDENTIALS.map((credential) => (
            <Card
              key={credential.code}
              className={cn(
                "gap-5 transition-shadow hover:shadow-md",
                credential.featured &&
                  "border-primary/30 ring-2 ring-primary/10",
              )}
            >
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    className={cn(
                      BADGE_BASE,
                      "rounded-md border-transparent px-2.5 font-mono font-bold",
                      credential.featured
                        ? "bg-primary text-primary-foreground"
                        : TONES[credential.codeTone].badge,
                    )}
                  >
                    {credential.code}
                  </Badge>
                  <Badge
                    className={cn(
                      BADGE_BASE,
                      "border-transparent font-bold",
                      TONES[credential.turnaroundTone].badge,
                    )}
                  >
                    {credential.turnaround}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {credential.featured && (
                    <p
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-bold",
                        TONES.brand.value,
                      )}
                    >
                      <Star
                        className="size-4 fill-current"
                        aria-hidden="true"
                      />
                      {FEATURED_LABEL}
                    </p>
                  )}
                  <CardTitle
                    role="heading"
                    aria-level={3}
                    className="text-xl font-bold"
                  >
                    {credential.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {credential.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <dl className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
                  {credential.details.map(({ label, value, tone }) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{label}:</dt>
                      <dd
                        className={cn(
                          VALUE_BASE,
                          "text-right leading-snug",
                          TONES[tone].value,
                        )}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>

              <CardFooter className="items-center justify-between gap-3 border-t">
                <div>
                  <span className="block text-sm text-muted-foreground">
                    {credential.feeLabel}
                  </span>
                  <p
                    className={cn(
                      VALUE_BASE,
                      "mt-1.5 text-2xl",
                      TONES[credential.feeTone].value,
                    )}
                  >
                    {credential.fee}
                    {credential.feeSuffix && (
                      <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                        {credential.feeSuffix}
                      </span>
                    )}
                  </p>
                </div>
                <a
                  href={credential.requestHref}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "text-base font-bold",
                  )}
                >
                  {REQUEST_LABEL}
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className={cn(ICON_BOX_BASE, "size-11", TONES.brand.icon)}>
                <Info className="size-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {CATALOG_CALLOUT.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {CATALOG_CALLOUT.description}
                </p>
              </div>
            </div>
            <a
              href={CATALOG_CALLOUT.ctaHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "shrink-0 rounded-xl px-6 text-base font-bold",
              )}
            >
              {CATALOG_CALLOUT.ctaLabel}
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
