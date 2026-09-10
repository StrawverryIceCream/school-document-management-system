import { getAllUsers } from "@/api/user";
import AccountsHeader from "@/components/accounts/AccountsHeader";
import AccountsTable from "@/components/accounts/AccountsTable";
import SearchToolbar from "@/components/accounts/SearchToolbar";
import type { User } from "@/types";
import { useEffect, useState } from "react";

function Accounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <AccountsHeader />
        <SearchToolbar />
        <AccountsTable datas={users} loading={loading}/>
      </div>
    </div>
  );
}

export default Accounts;
