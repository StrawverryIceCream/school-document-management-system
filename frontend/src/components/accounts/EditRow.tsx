import type { User } from "@/types";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateUserById } from "@/api/users";
import { useUsers } from "@/hooks/useUsers";
import { ACCOUNT_STATUS } from "@/lib/accounts/accounts-table";

function EditRow({
  user,
  setEdit,
}: {
  user: User;
  setEdit: (isEditing: boolean, userId: string) => void;
}) {
  const { refreshAccounts } = useUsers();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [studentId, setStudentId] = useState(user.studentId);

  async function handleSubmit() {
    try {
      setEdit(false, user.id);
      await updateUserById(user.id, { fullName, email, studentId });
      refreshAccounts();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <TableCell>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="h-8 text-sm"
        />
      </TableCell>
      <TableCell>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-8 text-sm"
        />
      </TableCell>
      <TableCell className="text-sm font-medium">{user.role}</TableCell>
      <TableCell>
        <Input
          value={studentId ? studentId : ""}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Student ID"
          className="h-8 text-sm"
        />
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className="gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        >
          <span
            className="size-1.5 rounded-full shrink-0 bg-emerald-600"
            aria-hidden="true"
          />
          {ACCOUNT_STATUS.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={handleSubmit}
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={() => {
              setFullName(user.fullName);
              setEmail(user.email);
              setStudentId(user.studentId);
              setEdit(false, user.id);
            }}
          >
            Cancel
          </Button>
        </div>
      </TableCell>
    </>
  );
}

export default EditRow;
