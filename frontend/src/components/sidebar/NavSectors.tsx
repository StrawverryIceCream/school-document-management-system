import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSectorsVisibility } from "@/hooks/useSectorsVisibility";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { Badge } from "@/components/ui/badge";

export default function NavSectors() {
  const location = useLocation();
  const { visibleSectors, showInactive, setShowInactive } =
    useSectorsVisibility();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { sectorCounts, divisionCounts } = useSidebarCounts();

  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const sector of visibleSectors) {
        if (location.pathname.startsWith(`/sectors/${sector.id}`)) {
          initial[sector.id] = true;
        }
      }
      return initial;
    },
  );

  // Auto-expand sector when navigating to it
  useEffect(() => {
    void Promise.resolve().then(() => {
      for (const sector of visibleSectors) {
        if (location.pathname.startsWith(`/sectors/${sector.id}`)) {
          setOpenSectors((prev) =>
            prev[sector.id] ? prev : { ...prev, [sector.id]: true },
          );
        }
      }
    });
  }, [location.pathname, visibleSectors]);

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between pr-2">
        <SidebarGroupLabel className="font-mono">SECTORS</SidebarGroupLabel>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={
              showInactive
                ? "Showing all units (click to view active only)"
                : "Showing active units only (click to view all)"
            }
            aria-label={
              showInactive
                ? "Show only active sectors and divisions"
                : "Show all configured sectors and divisions"
            }
          >
            {showInactive ? (
              <Eye className="size-3.5 text-primary" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
            <span className="hidden group-data-[collapsible=icon]:hidden lg:inline">
              {showInactive ? "All" : "Active"}
            </span>
          </button>
        )}
      </div>

      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu>
          {visibleSectors.map((sector) => {
            const Icon = sector.icon;
            const firstDivisionId = sector.divisions[0]?.id;
            const targetUrl = firstDivisionId
              ? `/sectors/${sector.id}/${firstDivisionId}`
              : `/sectors/${sector.id}`;
            const isSectorActive = location.pathname.startsWith(
              `/sectors/${sector.id}`,
            );
            const isOpen = openSectors[sector.id] ?? false;

            return (
              <SidebarMenuItem key={sector.id}>
                <SidebarMenuButton
                  isActive={isSectorActive}
                  className="text-base font-medium"
                  asChild
                >
                  <NavLink
                    to={targetUrl}
                    onClick={() => {
                      setOpenSectors((prev) => ({
                        ...prev,
                        [sector.id]: true,
                      }));
                    }}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span>{sector.code}</span>
                    <span className="text-xs text-muted-foreground ml-auto hidden group-data-[collapsible=icon]:hidden lg:inline truncate max-w-16 text-right">
                      {sector.shortName}
                    </span>
                    {(sectorCounts[sector.code] ?? 0) > 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "shrink-0 h-4 px-1.5 text-[10px] font-semibold rounded-full group-data-[collapsible=icon]:hidden",
                          sector.divisions.length > 0 ? "mr-6" : "mr-0",
                        )}
                      >
                        {sectorCounts[sector.code]}
                      </Badge>
                    )}
                  </NavLink>
                </SidebarMenuButton>

                {sector.divisions.length > 0 && (
                  <SidebarMenuAction
                    aria-label={`Toggle ${sector.code} divisions`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenSectors((prev) => ({
                        ...prev,
                        [sector.id]: !prev[sector.id],
                      }));
                    }}
                  >
                    <ChevronRight
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isOpen && "rotate-90",
                      )}
                    />
                  </SidebarMenuAction>
                )}

                {isOpen && sector.divisions.length > 0 && (
                  <SidebarMenuSub>
                    {sector.divisions.map((division) => {
                      const divisionUrl = `/sectors/${sector.id}/${division.id}`;
                      const isDivisionActive =
                        location.pathname.startsWith(divisionUrl);
                      const label = division.name;
                      const dCount = divisionCounts[division.id] ?? 0;

                      return (
                        <SidebarMenuSubItem key={division.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isDivisionActive}
                          >
                            <NavLink
                              to={divisionUrl}
                              className="flex items-center justify-between gap-2 w-full pr-1"
                            >
                              <span className="truncate">{label}</span>
                              {dCount > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 h-3.5 px-1 text-[9px] font-mono rounded-full bg-muted-foreground/10 text-muted-foreground"
                                >
                                  {dCount}
                                </Badge>
                              )}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
