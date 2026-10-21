import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { DivisionConfig } from "@/lib/sectors/sectors-config";

interface SectorDivisionTabsProps {
  sectorId: string;
  divisions: DivisionConfig[];
  activeDivisionId: string;
}

export default function SectorDivisionTabs({
  sectorId,
  divisions,
  activeDivisionId,
}: SectorDivisionTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Sector divisions"
      className="flex flex-wrap items-center gap-2 border-b pb-2"
    >
      {divisions.map((division) => {
        const isActive = division.id === activeDivisionId;
        return (
          <NavLink
            key={division.id}
            to={`/sectors/${sectorId}/${division.id}`}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {division.name}
          </NavLink>
        );
      })}
    </div>
  );
}
