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
  DEPARTMENT_OPTIONS,
  FACULTY_RANK_OPTIONS,
  type FacultyRank,
} from "@/lib/signup/arch-registration";

type FacultyFieldsProps = {
  facultyId: string;
  setFacultyId: Dispatch<SetStateAction<string>>;
  departmentValue: string;
  setDepartmentValue: Dispatch<SetStateAction<string>>;
  facultyRank: FacultyRank;
  setFacultyRank: Dispatch<SetStateAction<FacultyRank>>;
  clearanceOfficer: string;
  setClearanceOfficer: Dispatch<SetStateAction<string>>;
};

function FacultyFields({
  facultyId,
  setFacultyId,
  departmentValue,
  setDepartmentValue,
  facultyRank,
  setFacultyRank,
  clearanceOfficer,
  setClearanceOfficer,
}: FacultyFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-sm font-semibold" htmlFor="faculty-id">
            Faculty / Employee ID
          </Label>
          <Input
            className="uppercase"
            id="faculty-id"
            onChange={(e) => setFacultyId(e.target.value)}
            placeholder="EMP-2018-0412"
            value={facultyId}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Issued by the University HRD Registry
          </p>
        </div>
        <div>
          <Label className="mb-1 block text-sm font-semibold" htmlFor="faculty-college">
            Assigned College / Department
          </Label>
          <Select onValueChange={setDepartmentValue} value={departmentValue}>
            <SelectTrigger id="faculty-college">
              <SelectValue placeholder="Select affiliated college..." />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENT_OPTIONS.map((option) => (
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
          <Label className="mb-1 block text-sm font-semibold" htmlFor="faculty-rank">
            Academic Rank
          </Label>
          <Select
            onValueChange={(value) => setFacultyRank(value as FacultyRank)}
            value={facultyRank}
          >
            <SelectTrigger id="faculty-rank">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FACULTY_RANK_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block text-sm font-semibold" htmlFor="clearance-officer">
            Clearance Officer Approval
          </Label>
          <Input
            id="clearance-officer"
            onChange={(e) => setClearanceOfficer(e.target.value)}
            placeholder="e.g. Dean / Dept. Chairperson"
            value={clearanceOfficer}
          />
        </div>
      </div>
    </div>
  );
}

export default FacultyFields;