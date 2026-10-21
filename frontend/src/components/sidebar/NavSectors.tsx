import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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
import { SECTORS } from "@/lib/sectors/sectors-config";

export default function NavSectors() {
  const location = useLocation();

  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const sector of SECTORS) {
        if (location.pathname.startsWith(`/sectors/${sector.id}`)) {
          initial[sector.id] = true;
        }
      }
      return initial;
    },
  );

  // Auto-expand sector when navigating to it
  useEffect(() => {
    for (const sector of SECTORS) {
      if (location.pathname.startsWith(`/sectors/${sector.id}`)) {
        setOpenSectors((prev) =>
          prev[sector.id] ? prev : { ...prev, [sector.id]: true },
        );
      }
    }
  }, [location.pathname]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono">SECTORS</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu>
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            const targetUrl = `/sectors/${sector.id}/${sector.divisions[0].id}`;
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
                    <span className="text-xs text-muted-foreground ml-auto hidden group-data-[collapsible=icon]:hidden lg:inline truncate max-w-20 text-right pr-6">
                      {sector.shortName}
                    </span>
                  </NavLink>
                </SidebarMenuButton>

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

                {isOpen && (
                  <SidebarMenuSub>
                    {sector.divisions.map((division) => {
                      const divisionUrl = `/sectors/${sector.id}/${division.id}`;
                      const isDivisionActive =
                        location.pathname.startsWith(divisionUrl);
                      const label = division.name;

                      return (
                        <SidebarMenuSubItem key={division.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isDivisionActive}
                          >
                            <NavLink
                              to={divisionUrl}
                              className="flex items-center gap-2"
                            >
                              <span className="truncate">{label}</span>
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
