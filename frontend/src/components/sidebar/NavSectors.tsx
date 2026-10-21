import { NavLink, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SECTORS } from "@/lib/sectors/sectors-config";

export default function NavSectors() {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono">SECTORS</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            const targetUrl = `/sectors/${sector.id}/${sector.divisions[0].id}`;
            const isActive = location.pathname.startsWith(
              `/sectors/${sector.id}`,
            );

            return (
              <SidebarMenuItem key={sector.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  className="text-base font-medium"
                  asChild
                >
                  <NavLink to={targetUrl}>
                    <Icon className="size-5 shrink-0" />
                    <span>{sector.code}</span>
                    <span className="text-xs text-muted-foreground ml-auto hidden group-data-[collapsible=icon]:hidden lg:inline truncate max-w-28 text-right">
                      {sector.shortName}
                    </span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
