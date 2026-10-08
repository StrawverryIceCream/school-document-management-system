
import AccountsHeader from "@/components/accounts/AccountsHeader";
import AccountsOverview from "@/components/accounts/AccountsOverview";
import AccountsTable from "@/components/accounts/AccountsTable";
import SearchToolbar from "@/components/accounts/SearchToolbar";

import { UsersProvider } from "@/provider/UsersProvider";

function Accounts() {
  return (
    <UsersProvider>
      <div className="h-full overflow-auto p-6 sm:p-10">
        <div className="h-full space-y-6">
          <AccountsHeader />
          <AccountsOverview />
          <SearchToolbar />
          <AccountsTable />
        </div>
      </div>
    </UsersProvider>
  );
}

export default Accounts;
