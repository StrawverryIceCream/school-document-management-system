import type { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type React from "react";
import { NavLink } from "react-router-dom";

function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    onClick?: () => void;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                <SidebarMenuButton
                  type="button"
                  tooltip={item.title}
                  className="text-base font-medium cursor-pointer"
                  onClick={item.onClick}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  className="text-base font-medium"
                  asChild
                >
                  <NavLink to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default NavSecondary;
