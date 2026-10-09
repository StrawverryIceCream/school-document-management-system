import { Outlet } from "react-router-dom";
import AppSidebar from "../sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import SiteHeader from "../sidebar/SiteHeader";
import { NotificationProvider } from "@/provider/NotificationProvider";

function AppLayout() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col overflow-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NotificationProvider>
  );
}

export default AppLayout;
