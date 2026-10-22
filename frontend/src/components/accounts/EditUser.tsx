import { useState } from "react";
import { EllipsisVertical, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types";
import { deleteUserById } from "@/api/users";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import EditUserDialog from "@/components/accounts/EditUserDialog";
import ChangeRoleDialog from "@/components/accounts/ChangeRoleDialog";

interface EditUserProps {
  user: User;
  setEdit?: (isEditing: boolean, userId: string) => void;
}

function EditUser({ user }: EditUserProps) {
  const { refreshAccounts } = useUsers();
  const { user: currentUser } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  if (!currentUser) return null;

  async function handleDeleteUser() {
    if (!window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      return;
    }
    try {
      await deleteUserById(user.id);
      await refreshAccounts();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  }

  return (
    <>
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
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 size-3.5" />
            Edit Details
          </DropdownMenuItem>

          {user.id !== currentUser.id && (
            <>
              <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
                <ShieldCheck className="mr-2 size-3.5" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDeleteUser}>
                <Trash2 className="mr-2 size-3.5" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        user={user}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <ChangeRoleDialog
        user={user}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
      />
    </>
  );
}

export default EditUser;
