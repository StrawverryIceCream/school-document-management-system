import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/useUsers";
import {
  COUNT_PLACEHOLDER,
  OVERVIEW_ARIA_LABEL,
  STAT_CONFIGS,
} from "@/lib/accounts-overview";
import { ICON_BOX_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "cn";

export default function AccountsOverview() {
  const { counts, loading, error } = useUsers();

  return (
    <section
      aria-label={OVERVIEW_ARIA_LABEL}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
    >
      {STAT_CONFIGS.map(
        ({
          key,
          label,
          caption,
          captionIcon: CaptionIcon,
          captionTone,
          icon: Icon,
          tone,
        }) => (
          <Card key={key} className="gap-4 rounded-2xl px-5 py-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-base font-medium text-muted-foreground">
                {label}
              </span>
              <div className={cn(ICON_BOX_BASE, "size-11", TONES[tone].icon)}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="flex items-end justify-between gap-3">
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <span
                  className={cn(VALUE_BASE, "text-4xl", TONES.neutral.value)}
                >
                  {error ? COUNT_PLACEHOLDER : counts[key]}
                </span>
              )}
              <span
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  captionTone
                    ? TONES[captionTone].value
                    : "text-muted-foreground",
                )}
              >
                {CaptionIcon && (
                  <CaptionIcon className="size-4" aria-hidden="true" />
                )}
                {caption}
              </span>
            </div>
          </Card>
        ),
      )}
    </section>
  );
}
