import { EllipsisVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "../ui/dropdown-menu";
import { userRoles, type User, type UserRole } from "@/types";
import { deleteUserById, updateUserById } from "@/api/user";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";

function EditUser({
  user,
  setEdit,
}: {
  user: User;
  setEdit: (isEditing: boolean, userId: string) => void;
}) {
  const { refreshAccounts } = useUsers();
  const { user: currentUser } = useAuth();

  if (!currentUser) return null;
  async function handleRoleChange(role: UserRole) {
    try {
      await updateUserById(user.id, { role });
      refreshAccounts();
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteUser() {
    try {
      await deleteUserById(user.id);
      await refreshAccounts();
    } catch (err) {
      console.log("Failed to delete user:", err);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          onClick={() => {
            setEdit(true, user.id);
          }}
        >
          Edit
        </DropdownMenuItem>
        {user.id !== currentUser.id ? (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {userRoles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onSelect={() => handleRoleChange(role)}
                    >
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDeleteUser}>
              Delete
            </DropdownMenuItem>
          </>
        ) : (
          <></>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EditUser;
