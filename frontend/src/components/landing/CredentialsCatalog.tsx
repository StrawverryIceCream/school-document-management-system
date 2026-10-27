import { useEffect, useState } from "react";
import { Info, Star } from "lucide-react";
import { getAllDocument } from "@/api/documents";
import { useAuth } from "@/hooks/useAuth";
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
  FEATURED_LABEL,
  REQUEST_LABEL,
} from "@/lib/landing/credentials-catalog";
import { BADGE_BASE, ICON_BOX_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types";

export default function CredentialsCatalog() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDocument({ isActive: true, limit: 100 })
      .then((res) => setDocuments(res.data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const catalogCtaHref = user ? "/new-request" : "/login";

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

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="h-64 animate-pulse gap-0 overflow-hidden bg-muted py-0"
              />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            No active document types found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc, index) => {
              // First doc gets featured styling
              const featured = index === 0;
              const turnaroundLabel =
                doc.processingDays === 0
                  ? "Instant (Auto)"
                  : doc.processingDays === 1
                    ? "1 Business Day"
                    : `${doc.processingDays} Business Days`;
              const turnaroundTone =
                doc.processingDays === 0
                  ? "emerald"
                  : doc.processingDays <= 2
                    ? "sky"
                    : doc.processingDays <= 5
                      ? "amber"
                      : "neutral";

              return (
                <Card
                  key={doc.id}
                  className={cn(
                    "gap-5 transition-shadow hover:shadow-md",
                    featured && "border-primary/30 ring-2 ring-primary/10",
                  )}
                >
                  <CardHeader className="gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <Badge
                        className={cn(
                          BADGE_BASE,
                          "rounded-md border-transparent px-2.5 font-mono font-bold",
                          featured
                            ? "bg-primary text-primary-foreground"
                            : TONES.brand.badge,
                        )}
                      >
                        {doc.code}
                      </Badge>
                      <Badge
                        className={cn(
                          BADGE_BASE,
                          "border-transparent font-bold",
                          TONES[turnaroundTone].badge,
                        )}
                      >
                        {turnaroundLabel}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      {featured && (
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
                        {doc.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {doc.description ?? "Official university document."}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <dl className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Audience:</dt>
                        <dd
                          className={cn(
                            VALUE_BASE,
                            "text-right leading-snug capitalize",
                            TONES.neutral.value,
                          )}
                        >
                          {doc.category}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Max Copies:</dt>
                        <dd
                          className={cn(
                            VALUE_BASE,
                            "text-right leading-snug",
                            TONES.neutral.value,
                          )}
                        >
                          {doc.maxCopies}
                        </dd>
                      </div>
                      {doc.requiredFields.length > 0 && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">
                            Form Fields:
                          </dt>
                          <dd
                            className={cn(
                              VALUE_BASE,
                              "text-right leading-snug",
                              TONES.neutral.value,
                            )}
                          >
                            {doc.requiredFields.length} Fields
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>

                  <CardFooter className="items-center justify-between gap-3 border-t">
                    <div>
                      <span className="block text-sm text-muted-foreground">
                        Assessment Fee
                      </span>
                      <p
                        className={cn(
                          VALUE_BASE,
                          "mt-1.5 text-2xl",
                          Number(doc.fee) === 0
                            ? TONES.emerald.value
                            : TONES.brand.value,
                        )}
                      >
                        {Number(doc.fee) === 0
                          ? "₱0.00"
                          : `₱${Number(doc.fee).toFixed(2)}`}
                        {Number(doc.fee) === 0 && (
                          <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                            (Waived)
                          </span>
                        )}
                      </p>
                    </div>
                    <a
                      href={user ? `/new-request/${doc.id}` : "/login"}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "text-base font-bold",
                      )}
                    >
                      {REQUEST_LABEL}
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

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
              href={catalogCtaHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "shrink-0 rounded-xl px-6 text-base font-bold",
              )}
            >
              {loading
                ? "Loading…"
                : `View Complete Catalog (${documents.length})`}
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
