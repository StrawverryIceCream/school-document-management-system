import AccountsHeader from "@/components/accounts/AccountsHeader";
import AccountsOverview from "@/components/accounts/AccountsOverview";
import AccountsTable from "@/components/accounts/AccountsTable";
import SearchToolbar from "@/components/accounts/SearchToolbar";

import { UsersProvider } from "@/provider/UsersProvider";

function Accounts() {
  return (
    <UsersProvider>
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
        <AccountsHeader />
        <AccountsOverview />
        <SearchToolbar />

        <div className="flex min-h-0 flex-1 flex-col">
          <AccountsTable />
        </div>
      </div>
    </UsersProvider>
  );
}

export default Accounts;
