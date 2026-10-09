import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import EditUser from "./EditUser";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { useState } from "react";
import EditRow from "./EditRow";
import { useUsers } from "@/hooks/useUsers";

function AccountsTable() {
  const { loading, users, error } = useUsers();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  function setEdit(isEditing: boolean, userId: string) {
    setEditingUser(isEditing ? userId : null);
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Something went wrong: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead className="w-40">ID</TableHead>
            <TableHead className="w-75">Name</TableHead>
            <TableHead className="w-100">Email</TableHead>
            <TableHead className="w-60">Role</TableHead>
            <TableHead className="w-75">Student ID</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-12 text-center text-muted-foreground"
              >
                No accounts match your current filters.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="align-middle">
                <TableCell className="font-medium truncate">
                  {user.id}
                </TableCell>
                {editingUser === user.id ? (
                  <EditRow user={user} setEdit={setEdit} />
                ) : (
                  <>
                    <TableCell>
                      <ProfileTrigger userId={user.id}>
                        <button type="button" className="text-left font-medium text-foreground hover:underline">
                          {user.fullName}
                        </button>
                      </ProfileTrigger>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.studentId}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <EditUser user={user} setEdit={setEdit} />
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default AccountsTable;
