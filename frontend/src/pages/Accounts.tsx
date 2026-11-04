import { useState } from "react";
import { Navigate } from "react-router-dom";
import AccountsHeader from "@/components/accounts/AccountsHeader";
import AccountsOverview from "@/components/accounts/AccountsOverview";
import AccountsTable from "@/components/accounts/AccountsTable";
import SearchToolbar from "@/components/accounts/SearchToolbar";
import AccountUpdatesTab from "@/components/accounts/AccountUpdatesTab";
import { UsersProvider } from "@/provider/UsersProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export default function Accounts() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  const isAdmin = user?.role === "admin";
  const isRegistrarStaff =
    user?.role === "staff" &&
    (user.office === "registrar" || (user as any).officeId === "OUR");

  if (!isAdmin && !isRegistrarStaff) {
    return <Navigate to="/home" replace />;
  }

  return (
    <UsersProvider>
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
        <AccountsHeader />

        {isAdmin ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <TabsList className="w-fit">
              <TabsTrigger value="users">User Directory</TabsTrigger>
              <TabsTrigger value="updates">Term Update Requests</TabsTrigger>
            </TabsList>

            <TabsContent
              value="users"
              className="flex min-h-0 flex-1 flex-col gap-4 outline-none data-[state=inactive]:hidden"
            >
              <AccountsOverview />
              <SearchToolbar />
              <div className="flex min-h-0 flex-1 flex-col">
                <AccountsTable />
              </div>
            </TabsContent>

            <TabsContent
              value="updates"
              className="flex min-h-0 flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <AccountUpdatesTab />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <AccountUpdatesTab />
          </div>
        )}
      </div>
    </UsersProvider>
  );
}
