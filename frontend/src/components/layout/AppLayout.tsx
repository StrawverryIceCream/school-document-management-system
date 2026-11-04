import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/sidebar/AppSidebar";
import SiteHeader from "@/components/sidebar/SiteHeader";
import { CommandMenu } from "@/components/shared/CommandMenu";
import SettingsDialog from "@/components/shared/SettingsDialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DocumentProvider } from "@/provider/DocumentProvider";
import { MyRequestProvider } from "@/provider/MyRequestProvider";
import { NotificationProvider } from "@/provider/NotificationProvider";
import { ProfileProvider } from "@/provider/ProfileProvider";

function AppLayout() {
  return (
    <NotificationProvider>
      <DocumentProvider>
        <MyRequestProvider>
          <ProfileProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <SiteHeader />
                <main className="flex flex-1 flex-col overflow-hidden">
                  {/* Keeps the sidebar mounted while a lazy page chunk loads */}
                  <Suspense
                    fallback={
                      <div className="p-6 text-sm text-muted-foreground sm:p-10">
                        Loading...
                      </div>
                    }
                  >
                    <Outlet />
                  </Suspense>
                </main>
              </SidebarInset>
              <CommandMenu />
              <SettingsDialog />
            </SidebarProvider>
          </ProfileProvider>
        </MyRequestProvider>
      </DocumentProvider>
    </NotificationProvider>
  );
}

export default AppLayout;
