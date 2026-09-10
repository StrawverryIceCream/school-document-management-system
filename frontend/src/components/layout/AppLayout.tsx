import { Outlet } from "react-router-dom";
import AppSidebar from "../sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import SiteHeader from "../sidebar/SiteHeader";

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
