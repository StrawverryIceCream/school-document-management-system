import { useState } from "react";
import {
  EllipsisVertical,
  Pencil,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types";
import { deleteUserById, updateUserById } from "@/api/users";
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
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  if (!currentUser) return null;

  const isActive = user.isActive !== false;

  async function handleToggleActive() {
    const action = isActive ? "suspend" : "activate";
    if (
      !window.confirm(
        `Are you sure you want to ${action} the account for ${user.fullName}?`,
      )
    ) {
      return;
    }
    try {
      setIsTogglingActive(true);
      await updateUserById(user.id, { isActive: !isActive });
      await refreshAccounts();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    } finally {
      setIsTogglingActive(false);
    }
  }

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
        <DropdownMenuContent align="end" className="w-44">
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
              <DropdownMenuItem
                disabled={isTogglingActive}
                onClick={handleToggleActive}
                className={
                  isActive
                    ? "text-amber-600 dark:text-amber-400 focus:text-amber-700"
                    : "text-emerald-600 dark:text-emerald-400 focus:text-emerald-700"
                }
              >
                {isActive ? (
                  <>
                    <UserX className="mr-2 size-3.5" />
                    Suspend Account
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 size-3.5" />
                    Activate Account
                  </>
                )}
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
