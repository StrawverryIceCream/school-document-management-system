import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { formatStudentId } from "@/lib/auth";

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
