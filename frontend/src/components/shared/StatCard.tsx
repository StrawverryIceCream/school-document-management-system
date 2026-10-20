import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { BADGE_BASE, TONES, VALUE_BASE, type Tone } from "@/lib/tones";
import type { StatTag } from "@/lib/statcard";

export type StatCardProps = Omit<
  React.ComponentProps<typeof Card>,
  "children"
> & {
  label: string;
  value: number | string;
  caption?: string | null;
  subtext?: string | null;
  icon: LucideIcon;
  tone?: Tone;
  tag?: StatTag & { className?: string };
  loading?: boolean;
  valueClassName?: string;
  topBarColor?: string;
  compact?: boolean;
};

function StatCard({
  className,
  label,
  value,
  caption,
  subtext,
  icon: Icon,
  tone = "brand",
  tag,
  loading = false,
  valueClassName,
  topBarColor,
  compact = false,
  ...props
}: StatCardProps) {
  const TagIcon = tag?.icon;
  const description = caption || subtext;

  if (compact) {
    return (
      <Card
        className={cn(
          "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
          className,
        )}
        {...props}
      >
        {topBarColor && (
          <div
            className={cn(
              "absolute left-0 right-0 top-0 h-1 opacity-85",
              topBarColor,
            )}
          />
        )}
        <div className="mb-3 flex items-start justify-between gap-2 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              TONES[tone].icon,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span
                className={cn(
                  "text-2xl font-bold tracking-tight text-foreground",
                  valueClassName,
                )}
              >
                {value}
              </span>
            )}
            {!loading && tag && (
              <Badge
                variant="secondary"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  tag.className ?? (tag.tone !== "neutral" ? TONES[tag.tone].badge : undefined),
                )}
              >
                {TagIcon && <TagIcon className="h-3 w-3" aria-hidden="true" />}
                {tag.label}
              </Badge>
            )}
          </div>
          {!loading && description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative flex-row items-start justify-between gap-4 overflow-hidden rounded-2xl border-0 px-6 py-5 shadow-sm",
        className,
      )}
      {...props}
    >
      {topBarColor && (
        <div
          className={cn(
            "absolute left-0 right-0 top-0 h-1 opacity-85",
            topBarColor,
          )}
        />
      )}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-base font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2.5">
          {loading ? (
            <Skeleton className="h-12 w-20 rounded" />
          ) : (
            <span
              className={cn(
                VALUE_BASE,
                typeof value === "string" && value.length > 10
                  ? "text-2xl"
                  : "text-5xl",
                TONES[tone].value,
                valueClassName,
              )}
            >
              {value}
            </span>
          )}
          {!loading &&
            tag &&
            (tag.tone === "neutral" ? (
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                {TagIcon && <TagIcon className="size-3.5" aria-hidden="true" />}
                {tag.label}
              </span>
            ) : (
              <Badge
                variant="secondary"
                className={cn(
                  BADGE_BASE,
                  "text-base font-medium",
                  tag.className ?? TONES[tag.tone].badge,
                )}
              >
                {TagIcon && <TagIcon className="size-3.5" aria-hidden="true" />}
                {tag.label}
              </Badge>
            ))}
        </div>
        {!loading && description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>

      <div
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-xl",
          TONES[tone].icon,
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>
    </Card>
  );
}

export default StatCard;
