import {
  AppWindow,
  CircleDashedCheck,
  FileSearchCorner,
  FileText,
  Gauge,
  Search,
  Settings,
  UserRound,
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

const data = {
  user: { name: "Alyson" },
  admin: [
    {
      title: "Dashboard",
      url: "#",
      icon: Gauge,
    },
    {
      title: "Accounts",
      url: "#",
      icon: UserRound,
    },
    {
      title: "DocumentTypes",
      url: "#",
      icon: FileSearchCorner,
    },
    {
      title: "Windows",
      url: "#",
      icon: AppWindow,
    },
    {
      title: "All Request",
      url: "#",
      icon: CircleDashedCheck,
    },
  ],
  navSecondary: [
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
  ],
};

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon" variant="inset" className="transition-[width] ">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/home">
                <FileText className="size-5!" />
                <span className="text-base font-semibold">LOLLL</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={data.admin} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
