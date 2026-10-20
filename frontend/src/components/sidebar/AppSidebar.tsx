import {
  AppWindow,
  Archive,
  Building2,
  FileCheck,
  FileInputIcon,
  FolderCog,
  Inbox,
  LayoutDashboard,
  Logs,
  Notebook,
  Receipt,
  Search,
  Settings,
  UserCog,
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
} from "@/components/ui/sidebar";
import NavItems from "./NavItems";
import NavSecondary from "./NavSecondary";
import NavUser from "./NavUser";
import NavMain from "./NavMain";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { NavLink } from "react-router-dom";
import NavConfig from "./NavConfig";

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
    icon: LayoutDashboard,
    roles: ["admin", "staff"],
  },
  {
    title: "Review Queue",
    url: "/workspace/queue",
    icon: Inbox,
    roles: ["admin", "staff"],
  },
  {
    title: "Clearance Sign-Offs",
    url: "/workspace/signoffs",
    icon: FileCheck,
    roles: ["admin", "staff"],
  },
  {
    title: "Payments & Assessment",
    url: "/workspace/payments",
    icon: Receipt,
    roles: ["admin", "staff"],
  },
  {
    title: "Service Windows",
    url: "/workspace/windows",
    icon: AppWindow,
    roles: ["admin", "staff"],
  },
  {
    title: "Document Registry",
    url: "/workspace/registry",
    icon: Archive,
    roles: ["admin", "staff"],
  },
];

const navConfig: NavItem[] = [
  {
    title: "Document Catalog",
    url: "/admin/catalog",
    icon: FolderCog,
    roles: ["admin", "staff"],
  },
  {
    title: "Offices & Tree",
    url: "/admin/offices",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Accounts",
    url: "/admin/accounts",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Logs",
    url: "/admin/logs",
    icon: Logs,
    roles: ["admin"],
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
  const permittedNavConfigs = navConfig.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );

  return (
    <Sidebar collapsible="icon" variant="inset" className="transition-[width] ">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLink to="/home">
              <SidebarMenuButton
                size="lg"
                className="h-12 gap-3 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-11 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:size-7">
                  <Notebook className="size-8 group-data-[collapsible=icon]:size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-2xl font-bold">ARCH</span>
                  <span className="truncate text-xs font-mono">
                    SCHOOL DOCS
                  </span>
                </div>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {permittedNavItems.length > 0 && <NavItems items={permittedNavItems} />}
        {permittedNavConfigs.length > 0 && (
          <NavConfig items={permittedNavConfigs} />
        )}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
