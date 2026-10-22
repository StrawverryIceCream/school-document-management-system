import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_OFFICES } from "@/lib/sectors/sectors-config";
import { updateUserById, type UpdateUserBody } from "@/api/users";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types";
import { Loader2 } from "lucide-react";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const { refreshAccounts } = useUsers();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [studentId, setStudentId] = useState(user.studentId || "");
  const [department, setDepartment] = useState(user.department || "");
  const [officeId, setOfficeId] = useState(user.officeId || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync state if user changes or dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFullName(user.fullName);
      setEmail(user.email);
      setStudentId(user.studentId || "");
      setDepartment(user.department || "");
      setOfficeId(user.officeId || "");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: UpdateUserBody = {
        fullName: fullName.trim(),
        email: email.trim(),
      };

      if (user.role === "student") {
        payload.studentId = studentId.trim() || null;
      } else if (user.role === "teacher") {
        payload.department = department.trim() || null;
      } else if (user.role === "staff") {
        payload.officeId = officeId || null;
      }

      await updateUserById(user.id, payload);
      await refreshAccounts();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(err?.message || "Failed to update user details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Update account information for {user.fullName}.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="edit-fullName" className="text-xs font-medium">
                Full Name
              </Label>
              <Input
                id="edit-fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                required
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-medium">
                Email Address
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className="h-9 text-sm"
              />
            </div>

            {user.role === "student" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-studentId" className="text-xs font-medium">
                  Student ID
                </Label>
                <Input
                  id="edit-studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. TUPM-21-0001"
                  className="h-9 text-sm"
                />
              </div>
            )}

            {user.role === "teacher" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-department" className="text-xs font-medium">
                  Department
                </Label>
                <Input
                  id="edit-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Mathematics Department"
                  className="h-9 text-sm"
                />
              </div>
            )}

            {user.role === "staff" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-office" className="text-xs font-medium">
                  Assigned Office
                </Label>
                <Select
                  value={officeId}
                  onValueChange={(val) => setOfficeId(val)}
                >
                  <SelectTrigger id="edit-office" className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select assigned office" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {ALL_OFFICES.map((off) => (
                      <SelectItem key={off.id} value={off.id}>
                        {off.code} — {off.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
