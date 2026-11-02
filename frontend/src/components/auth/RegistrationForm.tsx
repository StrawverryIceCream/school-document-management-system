import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { signup, sendSignupOtp } from "@/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CredentialsFields from "@/components/auth/CredentialsFields";
import FacultyFields from "@/components/auth/FacultyFields";
import RoleSelector from "@/components/auth/RoleSelector";
import StudentFields from "@/components/auth/StudentFields";
import ComplianceNotice from "@/components/auth/ComplianceNotice";
import OtpVerificationModal from "@/components/auth/OtpVerificationModal";
import { useAuth } from "@/hooks/useAuth";
import {
  DEPARTMENT_OPTIONS,
  MIN_PASSWORD_LENGTH,
  STUDENT_ID_PREFIX,
  SYNC_BADGE_TONE,
  type FacultyRank,
  type StudentStatus,
} from "@/lib/auth/arch-registration";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { ACTIVE_ACADEMIC_TERM, SYSTEM_NAME } from "@/lib/constants";
import type { UserRole } from "@/types";

export default function RegistrationForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<Extract<UserRole, "student" | "teacher">>("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [studentId, setStudentId] = useState(STUDENT_ID_PREFIX);
  const [collegeId, setCollegeId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [yearLevel, setYearLevel] = useState<number | undefined>(undefined);
  const [section, setSection] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  // Display-only — signup() has no field for this yet (see lib/arch-registration.ts).
  const [studentStatus, setStudentStatus] = useState<StudentStatus>("regular");

  // Display-only — signup() has no field for faculty employee ID yet.
  const [facultyId, setFacultyId] = useState("");
  const [departmentValue, setDepartmentValue] = useState("");
  // Display-only — signup() has no field for academic rank yet.
  const [facultyRank, setFacultyRank] = useState<FacultyRank>("asst1");
  // Display-only — signup() has no field for clearance officer yet.
  const [clearanceOfficer, setClearanceOfficer] = useState("");

  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const selectedDepartment = DEPARTMENT_OPTIONS.find(
    (d) => d.value === departmentValue,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!agreedToPolicy) {
      setError("You must agree to the Data Privacy Policy to continue registration.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password confirmation.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
      return;
    }
    if (role === "student" && studentId === STUDENT_ID_PREFIX) {
      setError("Please enter your complete Student ID number as shown on your university RFID.");
      return;
    }
    if (role === "student" && (!collegeId || !courseId)) {
      setError("Please select both your college and your degree program.");
      return;
    }
    if (role === "teacher" && !selectedDepartment) {
      setError("Please select your assigned college or academic department.");
      return;
    }

    setLoading(true);
    try {
      await sendSignupOtp(email);
      setShowOtpModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code. Please check your email address and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(otp: string) {
    setVerifyingOtp(true);
    try {
      const fullName = [firstName, middleInitial, lastName]
        .filter(Boolean)
        .join(" ");

      await signup({
        email,
        password,
        fullName,
        role,
        studentStatus: role === "student" ? studentStatus : undefined,
        collegeId: role === "student" ? collegeId : undefined,
        courseId: role === "student" ? courseId : undefined,
        yearLevel: role === "student" ? yearLevel : undefined,
        section: role === "student" ? (section.trim() || undefined) : undefined,
        contactNumber: contactNumber.trim() || undefined,
        department: role === "teacher" ? (selectedDepartment?.label ?? "") : undefined,
        studentId:
          role === "student" && studentId !== STUDENT_ID_PREFIX
            ? studentId
            : undefined,
        otp,
      });
      await login(email, password);
      navigate("/home");
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleResendOtp() {
    await sendSignupOtp(email);
  }

  return (
    <Card className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl p-0 shadow-sm">
      <div className="border-b bg-muted/40 px-8 pb-6 pt-8">
        <div className="mb-2 flex items-center justify-between">
          <Badge
            className={cn(BADGE_BASE, "gap-1.5", TONES[SYNC_BADGE_TONE].badge)}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 animate-pulse motion-reduce:animate-none rounded-full",
                TONES[SYNC_BADGE_TONE].dot,
              )}
            />
            PostgreSQL SIS &amp; HRIS Direct Sync Active
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {ACTIVE_ACADEMIC_TERM}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Create your {SYSTEM_NAME} Account
        </h1>
        <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
          Register to submit official credential requests, track evaluation
          status, and receive cryptographic release slips.
        </p>
      </div>

      <form className="space-y-7 p-8" onSubmit={handleSubmit} aria-describedby={error ? "registration-error" : undefined}>
        <RoleSelector onRoleChange={setRole} role={role} />

        <CredentialsFields
          confirmPassword={confirmPassword}
          email={email}
          firstName={firstName}
          lastName={lastName}
          middleInitial={middleInitial}
          password={password}
          setConfirmPassword={setConfirmPassword}
          setEmail={setEmail}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setMiddleInitial={setMiddleInitial}
          setPassword={setPassword}
        />

        <div
          className="space-y-4 border-t pt-3"
          data-purpose="academic-verification-section"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Academic Verification Details
            </h2>
            <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-sm font-medium text-primary">
              {role === "student" ? "Student SIS Check" : "Faculty HRIS Check"}
            </span>
          </div>

          {role === "student" ? (
            <StudentFields
              collegeId={collegeId}
              contactNumber={contactNumber}
              courseId={courseId}
              section={section}
              setCollegeId={setCollegeId}
              setContactNumber={setContactNumber}
              setCourseId={setCourseId}
              setSection={setSection}
              setStudentId={setStudentId}
              setStudentStatus={setStudentStatus}
              setYearLevel={setYearLevel}
              studentId={studentId}
              studentStatus={studentStatus}
              yearLevel={yearLevel}
            />
          ) : (
            <FacultyFields
              clearanceOfficer={clearanceOfficer}
              departmentValue={departmentValue}
              facultyId={facultyId}
              facultyRank={facultyRank}
              setClearanceOfficer={setClearanceOfficer}
              setDepartmentValue={setDepartmentValue}
              setFacultyId={setFacultyId}
              setFacultyRank={setFacultyRank}
            />
          )}
        </div>

        <ComplianceNotice
          agreedToPolicy={agreedToPolicy}
          setAgreedToPolicy={setAgreedToPolicy}
        />

        {error && (
          <p
            id="registration-error"
            role="alert"
            aria-live="assertive"
            className="text-sm font-medium text-destructive"
          >
            {error}
          </p>
        )}

        <div className="space-y-3 pt-2" data-purpose="submission-cta">
          <Button className="w-full cursor-pointer" disabled={loading} size="lg" type="submit">
            {loading ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                Creating account...
              </>
            ) : (
              <>
                Register &amp; Verify Account
                <ArrowRight aria-hidden="true" className="size-4" />
              </>
            )}
          </Button>
          <div className="pt-2 text-center">
            <span className="text-sm text-muted-foreground">
              Already registered with your institutional ID?{" "}
            </span>
            <Link
              className="text-sm font-semibold text-primary hover:underline"
              to="/login"
            >
              Log in to your portal
            </Link>
          </div>
        </div>
      </form>

      <OtpVerificationModal
        email={email}
        loading={verifyingOtp}
        onClose={() => setShowOtpModal(false)}
        onResend={handleResendOtp}
        onVerify={handleVerifyOtp}
        open={showOtpModal}
      />
    </Card>
  );
}
