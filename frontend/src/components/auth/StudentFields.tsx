import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROGRAM_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  type StudentStatus,
} from "@/lib/signup/arch-registration";

type StudentFieldsProps = {
  studentId: string;
  setStudentId: Dispatch<SetStateAction<string>>;
  program: string;
  setProgram: Dispatch<SetStateAction<string>>;
  yearSection: string;
  setYearSection: Dispatch<SetStateAction<string>>;
  studentStatus: StudentStatus;
  setStudentStatus: Dispatch<SetStateAction<StudentStatus>>;
};

function StudentFields({
  studentId,
  setStudentId,
  program,
  setProgram,
  yearSection,
  setYearSection,
  studentStatus,
  setStudentStatus,
}: StudentFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="student-id"
          >
            Student ID Number
          </Label>
          <Input
            className="uppercase"
            id="student-id"
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="TUPM-24-6969"
            value={studentId}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Found on your university RFID or registration card
          </p>
        </div>
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="course-program"
          >
            Degree Program
          </Label>
          <Select onValueChange={setProgram} value={program}>
            <SelectTrigger id="course-program">
              <SelectValue placeholder="Select program..." />
            </SelectTrigger>
            <SelectContent>
              {PROGRAM_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="year-level"
          >
            Year Level &amp; Section
          </Label>
          <Input
            id="year-level"
            onChange={(e) => setYearSection(e.target.value)}
            placeholder="e.g. 3rd Year — BS-BIO-3A"
            value={yearSection}
          />
        </div>
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="student-status"
          >
            Academic Status
          </Label>
          <Select
            onValueChange={(value) => setStudentStatus(value as StudentStatus)}
            value={studentStatus}
          >
            <SelectTrigger id="student-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default StudentFields;
