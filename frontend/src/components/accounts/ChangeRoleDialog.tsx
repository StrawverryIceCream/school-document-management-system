import { useState, useEffect } from "react";
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
import { getOffices, type OfficeRecord } from "@/api/offices";
import { updateUserById, type UpdateUserBody } from "@/api/users";
import { useUsers } from "@/hooks/useUsers";
import { ROLE_META } from "@/lib/profile";
import type { User, UserRole } from "@/types";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ChangeRoleDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_ROLES: UserRole[] = ["student", "teacher", "staff", "admin"];

export default function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  const { refreshAccounts } = useUsers();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [studentId, setStudentId] = useState(user.studentId || "");
  const [department, setDepartment] = useState(user.department || "");
  const [officeId, setOfficeId] = useState(user.officeId || "");
  const [dbOffices, setDbOffices] = useState<OfficeRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOffices()
      .then((data) => {
        if (data && data.length > 0) setDbOffices(data);
      })
      .catch((err) => console.error("Could not fetch offices:", err));
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedRole(user.role);
      setStudentId(user.studentId || "");
      setDepartment(user.department || "");
      setOfficeId(user.officeId || "");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const officeOptions =
    dbOffices.length > 0
      ? dbOffices.map((o) => ({ id: o.id, code: o.code, name: o.name }))
      : ALL_OFFICES.map((o) => ({ id: o.id, code: o.code, name: o.name }));

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (selectedRole === user.role) {
      onOpenChange(false);
      return;
    }

    if (selectedRole === "staff" && !officeId) {
      setError("Please select an assigned office for staff");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: UpdateUserBody = {
        role: selectedRole,
      };

      if (selectedRole === "staff") {
        payload.officeId = officeId;
      } else if (selectedRole === "teacher") {
        payload.department = department.trim() || null;
      } else if (selectedRole === "student") {
        payload.studentId = studentId.trim() || null;
      }

      await updateUserById(user.id, payload);
      await refreshAccounts();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to change user role:", err);
      setError(err?.message || "Failed to change user role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleConfirm} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Change Account Role</DialogTitle>
            <DialogDescription>
              Assign a new role and configure role requirements for {user.fullName}.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="change-role" className="text-xs font-medium">
                Target Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => {
                  setSelectedRole(val as UserRole);
                  setError(null);
                }}
              >
                <SelectTrigger id="change-role" className="w-full h-9 text-sm capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {ROLE_META[r]?.label || r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole !== user.role && (
              <div className="flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">Role Transition Notice</p>
                  <p className="text-[11px] leading-relaxed text-amber-600/90 dark:text-amber-300/80">
                    Switching from <strong className="capitalize">{user.role}</strong> to{" "}
                    <strong className="capitalize">{selectedRole}</strong> will clear previous
                    incompatible credentials (such as previous office assignments or student records).
                  </p>
                </div>
              </div>
            )}

            {selectedRole === "staff" && (
              <div className="space-y-1.5">
                <Label htmlFor="staff-office" className="text-xs font-medium">
                  Assigned Office <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={officeId}
                  onValueChange={(val) => {
                    setOfficeId(val);
                    setError(null);
                  }}
                >
                  <SelectTrigger id="staff-office" className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select assigned office" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {officeOptions.map((off) => (
                      <SelectItem key={off.id} value={off.id}>
                        {off.code} — {off.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedRole === "teacher" && (
              <div className="space-y-1.5">
                <Label htmlFor="teacher-dept" className="text-xs font-medium">
                  Department
                </Label>
                <Input
                  id="teacher-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Studies"
                  className="h-9 text-sm"
                />
              </div>
            )}

            {selectedRole === "student" && (
              <div className="space-y-1.5">
                <Label htmlFor="student-id" className="text-xs font-medium">
                  Student ID
                </Label>
                <Input
                  id="student-id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. TUPM-21-0001"
                  className="h-9 text-sm"
                />
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
            <Button
              type="submit"
              size="sm"
              disabled={saving || (selectedRole === "staff" && !officeId)}
            >
              {saving && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
