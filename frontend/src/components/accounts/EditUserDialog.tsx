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
import type { StudentStatus, User } from "@/types";
import { Loader2 } from "lucide-react";
import StudentPlacementFields from "@/components/shared/StudentPlacementFields";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditUserForm({
  user,
  onOpenChange,
}: {
  user: User;
  onOpenChange: (open: boolean) => void;
}) {
  const { refreshAccounts } = useUsers();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [studentId, setStudentId] = useState(user.studentId || "");
  const [collegeId, setCollegeId] = useState(user.collegeId || "");
  const [courseId, setCourseId] = useState(user.courseId || "");
  const [studentStatus, setStudentStatus] = useState<StudentStatus | "">(
    (user.studentStatus as StudentStatus) || "",
  );
  const [yearLevel, setYearLevel] = useState(
    user.yearLevel ? String(user.yearLevel) : "",
  );
  const [section, setSection] = useState(user.section || "");
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

  const officeOptions =
    dbOffices.length > 0
      ? dbOffices.map((o) => ({ id: o.id, code: o.code, name: o.name }))
      : ALL_OFFICES.map((o) => ({ id: o.id, code: o.code, name: o.name }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required");
      return;
    }

    const isAlumni = studentStatus === "alumni";
    if (user.role === "student" && !courseId) {
      setError("Please select a degree program (course)");
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
        const cleanId = studentId.trim().toUpperCase();
        payload.studentId = !cleanId || cleanId === "TUPM-" ? null : cleanId;
        payload.collegeId = collegeId || null;
        payload.courseId = courseId;
        if (studentStatus) {
          payload.studentStatus = studentStatus;
        }
        payload.yearLevel = isAlumni
          ? null
          : yearLevel
            ? Number(yearLevel)
            : null;
        payload.section = isAlumni ? null : section.trim() || null;
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
          <StudentPlacementFields
            idPrefix={`edit-user-${user.id}`}
            showStandingFields
            collegeId={collegeId}
            setCollegeId={setCollegeId}
            courseId={courseId}
            setCourseId={setCourseId}
            studentId={studentId}
            setStudentId={setStudentId}
            studentStatus={studentStatus}
            setStudentStatus={setStudentStatus}
            yearLevel={yearLevel}
            setYearLevel={setYearLevel}
            section={section}
            setSection={setSection}
          />
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
                {officeOptions.map((off) => (
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
        <Button
          type="submit"
          size="sm"
          disabled={saving || (user.role === "student" && !courseId)}
        >
          {saving && <Loader2 className="mr-2 size-3.5 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {open && (
          <EditUserForm
            key={`${user.id}-${user.role}-${user.courseId ?? ""}-${user.section ?? ""}`}
            user={user}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
