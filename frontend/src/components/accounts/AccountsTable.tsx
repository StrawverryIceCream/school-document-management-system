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
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-muted">
        <TableRow>
          <TableHead className="w-40">ID</TableHead>
          <TableHead className="w-75">Name</TableHead>
          <TableHead className="w-100">Email</TableHead>
          <TableHead className="w-60">Role</TableHead>
          <TableHead className="w-75">Student ID</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium max-w-25 truncate">
              {user.id}
            </TableCell>
            {editingUser === user.id ? (
              <EditRow user={user} setEdit={setEdit} />
            ) : (
              <>
                <TableCell>
                  <ProfileTrigger userId={user.id}>
                    <button type="button" className="text-left hover:underline">
                      {user.fullName}
                    </button>
                  </ProfileTrigger>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.studentId}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <EditUser user={user} setEdit={setEdit} />
                  </div>
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default AccountsTable;
