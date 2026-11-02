import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequest";
import { Badge } from "@/components/ui/badge";
import { Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OfficeShortcuts() {
  const { user } = useAuth();
  const { officeFilter, setOfficeFilter, officeOptions, requests } = useRequests();

  // Determine user's assigned office if staff or admin
  const userOffice =
    user?.office ? String(user.office).toUpperCase() : null;

  const shortcuts = [
    { id: "all", label: "All Offices", icon: null },
    ...(userOffice
      ? [{ id: userOffice, label: "My Office", isMyOffice: true, icon: Sparkles }]
      : []),
    ...officeOptions
      .filter((opt) => opt !== userOffice)
      .map((opt) => ({
        id: opt,
        label: opt,
        isMyOffice: false,
        icon: Building2,
      })),
  ];

  if (shortcuts.length <= 1) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Office shortcuts"
      className="flex items-center gap-2 overflow-x-auto flex-nowrap scrollbar-none pb-1 min-w-0 w-full"
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
        Offices:
      </span>
      {shortcuts.map(({ id, label, icon: Icon, isMyOffice }) => {
        const isSelected =
          officeFilter.toLowerCase() === id.toLowerCase() ||
          (id === "all" && officeFilter === "all");

        const count =
          id === "all"
            ? requests.length
            : requests.filter((r) => {
                const target = id.toLowerCase();
                return (
                  r.officeCode?.toLowerCase() === target ||
                  r.officeName?.toLowerCase() === target
                );
              }).length;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setOfficeFilter(isSelected && id !== "all" ? "all" : id)}
            className={cn(
              "inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
            <span className="shrink-0">{isMyOffice ? `${label} (${userOffice})` : label}</span>
            <Badge
              variant={isSelected ? "secondary" : "outline"}
              className={cn(
                "h-4 px-1.5 text-[10px] font-semibold shrink-0",
                isSelected
                  ? "bg-primary-foreground/20 text-primary-foreground border-none"
                  : "bg-background text-muted-foreground",
              )}
            >
              {count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
