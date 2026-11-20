import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
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
  sanitizeContactNumber,
  STUDENT_STATUS_OPTIONS,
  type StudentStatus,
} from "@/lib/auth/arch-registration";
import {
  formatStudentId,
  STUDENT_ID_PREFIX,
} from "@/lib/auth/format-student-id";
import { getAllColleges } from "@/api/colleges";
import { getAllCourses } from "@/api/courses";
import type { College, Course } from "@/types";

type StudentFieldsProps = {
  studentId: string;
  setStudentId: Dispatch<SetStateAction<string>>;
  collegeId: string;
  setCollegeId: Dispatch<SetStateAction<string>>;
  courseId: string;
  setCourseId: Dispatch<SetStateAction<string>>;
  yearLevel?: number;
  setYearLevel: Dispatch<SetStateAction<number | undefined>>;
  section: string;
  setSection: Dispatch<SetStateAction<string>>;
  contactNumber?: string;
  setContactNumber: Dispatch<SetStateAction<string>>;
  studentStatus: StudentStatus;
  setStudentStatus: Dispatch<SetStateAction<StudentStatus>>;
};

const YEAR_LEVEL_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
];

function StudentFields({
  studentId,
  setStudentId,
  collegeId,
  setCollegeId,
  courseId,
  setCourseId,
  yearLevel,
  setYearLevel,
  section,
  setSection,
  contactNumber = "",
  setContactNumber,
  studentStatus,
  setStudentStatus,
}: StudentFieldsProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        const [collegesRes, coursesRes] = await Promise.all([
          getAllColleges({ isActive: true, limit: 100 }),
          getAllCourses({ isActive: true, limit: 100 }),
        ]);
        if (!cancelled) {
          setColleges(collegesRes.data);
          setCourses(coursesRes.data);
          setFetchError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError("Failed to load academic programs" + err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter courses by selected college; empty until a college is chosen
  const filteredCourses = collegeId
    ? courses.filter((c) => c.collegeId === collegeId)
    : [];

  function handleCollegeChange(newCollegeId: string) {
    setCollegeId(newCollegeId);
    const courseStillValid = courses.some(
      (c) => c.id === courseId && c.collegeId === newCollegeId,
    );
    if (!courseStillValid) {
      setCourseId("");
    }
  }

  return (
    <div className="space-y-4">
      {fetchError && <p className="text-xs text-destructive">{fetchError}</p>}

      {/* Row 1: Student ID & Contact Number */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="student-id"
          >
            Student ID Number
          </Label>
          <Input
            className="uppercase font-mono"
            id="student-id"
            onChange={(e) => setStudentId(formatStudentId(e.target.value))}
            onFocus={() => {
              if (!studentId) setStudentId(STUDENT_ID_PREFIX);
            }}
            placeholder="TUPM-24-1234"
            value={studentId}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Format: TUPM-XX-XXXX or TUPM-XX-XXXXX (from your university RFID)
          </p>
        </div>
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="contact-number"
          >
            Contact Number{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (Optional)
            </span>
          </Label>
          <Input
            autoComplete="tel"
            id="contact-number"
            inputMode="numeric"
            onChange={(e) => setContactNumber(sanitizeContactNumber(e.target.value))}
            pattern="[0-9]*"
            placeholder="09123456789"
            value={contactNumber}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Used for urgent document release notifications
          </p>
        </div>
      </div>

      {/* Row 2: College & Degree Program */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="college-select"
          >
            College / Faculty
          </Label>
          <Select
            disabled={loading}
            onValueChange={handleCollegeChange}
            value={collegeId}
          >
            <SelectTrigger id="college-select">
              <SelectValue
                placeholder={
                  loading ? "Loading colleges..." : "Select college..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {colleges.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.name} ({col.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="course-program"
          >
            Degree Program
          </Label>
          <Select
            disabled={loading || !collegeId || filteredCourses.length === 0}
            onValueChange={setCourseId}
            value={courseId}
          >
            <SelectTrigger id="course-program">
              <SelectValue
                placeholder={
                  loading
                    ? "Loading programs..."
                    : !collegeId
                      ? "Select a college first..."
                      : filteredCourses.length === 0
                        ? "No programs found for college"
                        : "Select degree program..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredCourses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Year Level & Section */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="year-level-select"
          >
            Year Level
          </Label>
          <Select
            onValueChange={(val) => setYearLevel(val ? Number(val) : undefined)}
            value={yearLevel ? String(yearLevel) : ""}
          >
            <SelectTrigger id="year-level-select">
              <SelectValue placeholder="Select year level..." />
            </SelectTrigger>
            <SelectContent>
              {YEAR_LEVEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label
            className="mb-1 block text-sm font-semibold"
            htmlFor="section-input"
          >
            Section
          </Label>
          <Input
            id="section-input"
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g. 3A"
            value={section}
          />
        </div>
      </div>

      {/* Row 4: Academic Status */}
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
  );
}

export default StudentFields;
