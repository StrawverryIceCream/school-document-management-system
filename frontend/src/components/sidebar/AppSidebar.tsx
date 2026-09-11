import {
  AppWindow,
  CircleDashedCheck,
  FileInputIcon,
  FileSearchCorner,
  FileText,
  Gauge,
  Search,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import NavItems from "./NavItems";
import NavSecondary from "./NavSecondary";
import NavUser from "./NavUser";
import NavMain from "./NavMain";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { NavLink } from "react-router-dom";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

const navMain: NavItem[] = [
  {
    title: "My Request ",
    url: "/my-request",
    icon: FileInputIcon,
  },
];

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Gauge,
    roles: ["admin", "staff"],
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: UserRound,
    roles: ["admin"],
  },
  {
    title: "Document Manager",
    url: "/document-manager",
    icon: FileSearchCorner,
    roles: ["admin", "staff"],
  },
  {
    title: "Windows",
    url: "/windows",
    icon: AppWindow,
    roles: ["admin", "staff"],
  },
  {
    title: "All Request",
    url: "/all-request",
    icon: CircleDashedCheck,
    roles: ["admin", "staff"],
  },
];

const navSecondary: NavItem[] = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
];

function AppSidebar() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  const permittedNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );
  return (
    <Sidebar collapsible="icon" variant="inset" className="transition-[width] ">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <NavLink to="/home">
                <FileText className="size-5!" />
                <span className="text-base font-semibold">Doc Manager.</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {permittedNavItems.length > 0 && <NavItems items={permittedNavItems} />}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
