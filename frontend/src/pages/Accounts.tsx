
import AccountsHeader from "@/components/accounts/AccountsHeader";
import AccountsTable from "@/components/accounts/AccountsTable";
import SearchToolbar from "@/components/accounts/SearchToolbar";

import { UsersProvider } from "@/provider/UsersProvider";


function Accounts() {
  return (
    <UsersProvider >
      <div className="h-full overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-full flex flex-col">
          <AccountsHeader />
          <SearchToolbar />
          <AccountsTable />
        </div>
      </div>
    </UsersProvider>
  );
}

export default Accounts;
