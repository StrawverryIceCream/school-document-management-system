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
  icon: LucideIcon;
  tone?: Tone;
  tag?: StatTag;
  loading?: boolean;
  valueClassName?: string;
};

function StatCard({
  className,
  label,
  value,
  caption,
  icon: Icon,
  tone = "brand",
  tag,
  loading = false,
  valueClassName,
  ...props
}: StatCardProps) {
  const TagIcon = tag?.icon;

  return (
    <Card
      className={cn(
        "flex-row items-start justify-between gap-4 rounded-2xl border-0 px-6 py-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-base font-medium uppercase tracking-wide text-muted-foreground font-mono">
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
                  TONES[tag.tone].badge,
                )}
              >
                {TagIcon && <TagIcon className="size-3.5" aria-hidden="true" />}
                {tag.label}
              </Badge>
            ))}
        </div>
        {!loading && caption && (
          <span className="text-sm text-muted-foreground">{caption}</span>
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
