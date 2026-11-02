import type { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { Badge } from "@/components/ui/badge";

function NavItems({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { total } = useSidebarCounts();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono">REQUEST</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className="text-base font-medium" asChild>
                <NavLink to={item.url} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <item.icon className="size-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.url === "/all-request" && total > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto shrink-0 h-4 px-1.5 text-[10px] font-semibold rounded-full bg-muted-foreground/15 text-foreground group-data-[collapsible=icon]:hidden"
                    >
                      {total}
                    </Badge>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default NavItems;
