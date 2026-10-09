import type { UserRole } from "@/types";
import { Field, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  TEACHER: "teacher",
  STAFF: "staff",
} as const;

function RoleField({
  role,
  setRole,
}: {
  role: UserRole;
  setRole: (value: UserRole) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="role">I am signing up as a</FieldLabel>
      <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
        <SelectTrigger id="role">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ROLES.STUDENT}>Student</SelectItem>
          <SelectItem value={ROLES.TEACHER}>Teacher</SelectItem>
          <SelectItem value={ROLES.STAFF}>Staff</SelectItem>
          <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}

export default RoleField;