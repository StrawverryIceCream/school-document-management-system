import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { TONES, TONE_TOP_BARS, type Tone } from "@/lib/tones";
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
  const activeTopBar = topBarColor ?? TONE_TOP_BARS[tone];
  const isLongValue = typeof value === "string" && value.length > 8;

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        compact ? "p-4" : "p-5",
        className,
      )}
      {...props}
    >
      {activeTopBar && (
        <div
          className={cn(
            "absolute left-0 right-0 top-0 h-1 opacity-85",
            activeTopBar,
          )}
        />
      )}
      <div className={cn("flex items-start justify-between gap-2 pt-1", compact ? "mb-2.5" : "mb-3.5")}>
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg",
            compact ? "h-8 w-8" : "h-9 w-9",
            TONES[tone].icon,
          )}
        >
          <Icon className={cn(compact ? "h-4 w-4" : "h-4.5 w-4.5")} aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-2">
          {loading ? (
            <Skeleton className={cn("rounded", compact ? "h-8 w-16" : "h-9 w-20")} />
          ) : (
            <span
              className={cn(
                "font-extrabold tracking-tight text-foreground",
                compact
                  ? isLongValue
                    ? "text-xl"
                    : "text-3xl"
                  : isLongValue
                    ? "text-xl sm:text-2xl"
                    : "text-3xl sm:text-4xl",
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
          <p className="text-xs text-muted-foreground leading-normal">{description}</p>
        )}
      </div>
    </Card>
  );
}

export default StatCard;
