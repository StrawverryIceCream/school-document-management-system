import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

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
        onChange={(e) => {
          // Pull out only the digits the user typed, capped at 6 (2 + 4)
          const digits = e.target.value
            .replace(/^TUPM-?/, "") // strip prefix if present
            .replace(/\D/g, "") // strip anything non-digit (including dashes)
            .slice(0, 6);

          let formatted = "TUPM-";
          if (digits.length > 0) {
            formatted += digits.slice(0, 2);
          }
          if (digits.length > 2) {
            formatted += "-" + digits.slice(2, 6);
          }

          setStudentId(formatted);
        }}
        onFocus={() => {
          if (!studentId) setStudentId("TUPM-");
        }}
      />
    </Field>
  );
}

export default StudentIdField;
