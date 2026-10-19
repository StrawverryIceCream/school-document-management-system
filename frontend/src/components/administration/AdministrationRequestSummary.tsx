import { BadgeCheck, Folder, Hourglass, type LucideIcon } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { useAdministrationView } from "@/hooks/useAdministrationView";
import type { Tone } from "@/lib/tones";

type SummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
  caption: string;
};

export default function AdministrationRequestSummary() {
  const { visibleRequests, activeUnit } = useAdministrationView();

  if (!activeUnit) return null;

  const pendingCount = visibleRequests.filter(
    (request) => request.status === "pending",
  ).length;
  const readyCount = visibleRequests.filter(
    (request) => request.status === "ready",
  ).length;

  const summaryCards: SummaryItem[] = [
    {
      label: "Office Requests",
      value: visibleRequests.length,
      icon: Folder,
      tone: "neutral",
      caption: `${activeUnit.code} active queue`,
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: Hourglass,
      tone: "amber",
      caption: "Awaiting approval",
    },
    {
      label: "Ready for Release",
      value: readyCount,
      icon: BadgeCheck,
      tone: "emerald",
      caption: "Processed documents",
    },
  ];

  return (
    <section
      aria-label={`${activeUnit.code} queue summary`}
      className="grid gap-4 sm:grid-cols-3"
    >
      {summaryCards.map(({ label, value, icon, tone, caption }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
          caption={caption}
        />
      ))}
    </section>
  );
}
