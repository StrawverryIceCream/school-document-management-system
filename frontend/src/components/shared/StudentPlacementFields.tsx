import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllColleges } from "@/api/colleges";
import { getAllCourses } from "@/api/courses";
import { formatStudentId } from "@/lib/auth/format-student-id";
import type { College, Course, StudentStatus } from "@/types";

interface StudentPlacementFieldsProps {
  idPrefix: string;
  collegeId: string;
  setCollegeId: (val: string) => void;
  courseId: string;
  setCourseId: (val: string) => void;
  showStandingFields?: boolean;
  studentId?: string;
  setStudentId?: (val: string) => void;
  studentStatus?: StudentStatus | "";
  setStudentStatus?: (val: StudentStatus) => void;
  yearLevel?: string;
  setYearLevel?: (val: string) => void;
  section?: string;
  setSection?: (val: string) => void;
}

export default function StudentPlacementFields({
  idPrefix,
  collegeId,
  setCollegeId,
  courseId,
  setCourseId,
  showStandingFields = false,
  studentId = "",
  setStudentId,
  studentStatus = "regular",
  setStudentStatus,
  yearLevel = "",
  setYearLevel,
  section = "",
  setSection,
}: StudentPlacementFieldsProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAllColleges({ isActive: true, limit: 100 }),
      getAllCourses({ isActive: true, limit: 100 }),
    ])
      .then(([colRes, courseRes]) => {
        if (!cancelled) {
          setColleges(colRes.data);
          setCourses(courseRes.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch colleges/courses:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const derivedCollegeId =
    collegeId ||
    courses.find((c) => c.id === courseId)?.collegeId ||
    "";

  const filteredCourses = derivedCollegeId
    ? courses.filter((c) => c.collegeId === derivedCollegeId)
    : courses;

  const isAlumni = studentStatus === "alumni";

  function handleCollegeChange(nextCollegeId: string) {
    setCollegeId(nextCollegeId);
    const valid = courses.some(
      (c) => c.id === courseId && c.collegeId === nextCollegeId,
    );
    if (!valid) {
      setCourseId("");
    }
  }

  function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);
    const match = courses.find((c) => c.id === nextCourseId);
    if (match && match.collegeId !== collegeId) {
      setCollegeId(match.collegeId);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-college`} className="text-xs font-medium">
          College
        </Label>
        <Select
          value={derivedCollegeId}
          onValueChange={handleCollegeChange}
          disabled={loading}
        >
          <SelectTrigger id={`${idPrefix}-college`} className="w-full h-9 text-sm">
            <SelectValue
              placeholder={loading ? "Loading colleges..." : "Select college"}
            />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {colleges.map((col) => (
              <SelectItem key={col.id} value={col.id}>
                {col.code} — {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-course`} className="text-xs font-medium">
          Degree Program (Course) <span className="text-destructive">*</span>
        </Label>
        <Select
          value={courseId}
          onValueChange={handleCourseChange}
          disabled={loading || filteredCourses.length === 0}
        >
          <SelectTrigger id={`${idPrefix}-course`} className="w-full h-9 text-sm">
            <SelectValue
              placeholder={
                loading
                  ? "Loading programs..."
                  : filteredCourses.length === 0
                    ? "No programs available"
                    : "Select degree program"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {filteredCourses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showStandingFields && (
        <>
          {setStudentId && (
            <div className="space-y-1.5">
              <Label
                htmlFor={`${idPrefix}-student-id`}
                className="text-xs font-medium"
              >
                Student ID
              </Label>
              <Input
                id={`${idPrefix}-student-id`}
                value={studentId}
                onChange={(e) => {
                  const raw = e.target.value;
                  const upper = raw.trim().toUpperCase();
                  setStudentId(
                    !upper || upper === "TUPM" || upper === "TUPM-"
                      ? ""
                      : formatStudentId(raw),
                  );
                }}
                placeholder="e.g. TUPM-24-0001"
                className="h-9 text-sm font-mono uppercase"
              />
            </div>
          )}

          {setStudentStatus && (
            <div className="space-y-1.5">
              <Label
                htmlFor={`${idPrefix}-student-status`}
                className="text-xs font-medium"
              >
                Student Status
              </Label>
              <Select
                value={studentStatus}
                onValueChange={(val) => setStudentStatus(val as StudentStatus)}
              >
                <SelectTrigger
                  id={`${idPrefix}-student-status`}
                  className="w-full h-9 text-sm"
                >
                  <SelectValue placeholder="Select student status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="graduating">Graduating</SelectItem>
                  <SelectItem value="alumni">Alumni / Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isAlumni && (setYearLevel || setSection) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {setYearLevel && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`${idPrefix}-year-level`}
                    className="text-xs font-medium"
                  >
                    Year Level
                  </Label>
                  <Select value={yearLevel} onValueChange={setYearLevel}>
                    <SelectTrigger
                      id={`${idPrefix}-year-level`}
                      className="w-full h-9 text-sm"
                    >
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                      <SelectItem value="5">5th Year</SelectItem>
                      <SelectItem value="6">6th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {setSection && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`${idPrefix}-section`}
                    className="text-xs font-medium"
                  >
                    Section
                  </Label>
                  <Input
                    id={`${idPrefix}-section`}
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. BSCS-3B"
                    className="h-9 text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
