import { Outlet } from "react-router-dom";
import AppSidebar from "../sidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="flex">
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default AppLayout;
