import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ICON_BOX_STYLES,
  TAG_BADGE_STYLES,
  VALUE_STYLES,
  type StatTag,
  type StatTone,
} from "@/lib/statcard";

type StatCardProps = Omit<React.ComponentProps<typeof Card>, "children"> & {
  label: string;
  value: number | string;
  caption: string;
  icon: LucideIcon;
  tone?: StatTone;
  tag?: StatTag;
};

function StatCard({
  className,
  label,
  value,
  caption,
  icon: Icon,
  tone = "neutral",
  tag,
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
          <span
            className={cn(
              "text-5xl font-bold leading-none tracking-tight ",
              VALUE_STYLES[tone],
            )}
          >
            {value}
          </span>
          {tag &&
            (tag.tone === "neutral" ? (
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                {TagIcon && <TagIcon className="size-3.5" aria-hidden="true" />}
                {tag.label}
              </span>
            ) : (
              <Badge
                variant="secondary"
                className={cn(
                  "gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                  TAG_BADGE_STYLES[tag.tone],
                )}
              >
                {TagIcon && <TagIcon className="size-3.5" aria-hidden="true" />}
                {tag.label}
              </Badge>
            ))}
        </div>
        <span className="text-sm text-muted-foreground">{caption}</span>
      </div>

      <div
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-xl",
          ICON_BOX_STYLES[tone],
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>
    </Card>
  );
}

export default StatCard;
