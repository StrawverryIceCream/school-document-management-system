import type { User } from "@/types";
import { Input } from "../ui/input";
import { TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { useState } from "react";
import { updateUserById } from "@/api/users";
import { useUsers } from "@/hooks/useUsers";
import { ACCOUNT_STATUS } from "@/lib/accounts-table";

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
          placeholder="Board name"
          className="text-2xl font-bold"
        />
      </TableCell>
      <TableCell>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Board name"
          className="text-2xl font-bold"
        />
      </TableCell>
      <TableCell>{user.role}</TableCell>
      <TableCell>
        <Input
          value={studentId ? studentId : ""}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Board name"
          className="text-2xl font-bold"
        />
      </TableCell>
      <TableCell className="text-base text-muted-foreground">
        {ACCOUNT_STATUS.label}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            className="flex"
            onClick={handleSubmit}
            disabled={false}
          >
            Save
          </Button>
          <Button
            variant="outline"
            className="flex"
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
