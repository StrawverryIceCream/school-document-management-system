import StatCard from "@/components/shared/StatCard";
import { useUsers } from "@/hooks/useUsers";
import {
  COUNT_PLACEHOLDER,
  OVERVIEW_ARIA_LABEL,
  STAT_CONFIGS,
} from "@/lib/accounts/accounts-overview";

export default function AccountsOverview() {
  const { counts, loading, error } = useUsers();

  return (
    <section
      aria-label={OVERVIEW_ARIA_LABEL}
      className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {STAT_CONFIGS.map(
        ({ key, label, caption, captionIcon, captionTone, icon, tone }) => (
          <StatCard
            key={key}
            label={label}
            value={error ? COUNT_PLACEHOLDER : counts[key]}
            icon={icon}
            tone={tone}
            loading={loading}
            tag={
              caption
                ? {
                    label: caption,
                    tone: captionTone ?? "neutral",
                    icon: captionIcon ?? undefined,
                  }
                : undefined
            }
          />
        ),
      )}
    </section>
  );
}
