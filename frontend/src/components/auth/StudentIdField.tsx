import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatStudentId } from "@/lib/auth/format-student-id";

function StudentIdField({
  studentId,
  setStudentId,
}: {
  studentId: string;
  setStudentId: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
      <Input
        id="studentId"
        type="text"
        placeholder="TUPM-XX-XXXX"
        required
        value={studentId}
        onChange={(e) => setStudentId(formatStudentId(e.target.value))}
        onFocus={() => {
          if (!studentId) setStudentId("TUPM-");
        }}
      />
    </Field>
  );
}

export default StudentIdField;
