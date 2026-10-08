import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import StudentIdField from "./StudentIdField";
import RoleField from "./RoleField";
import type { UserRole } from "@/types";

const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  TEACHER: "teacher",
  STAFF: "staff",
} as const;

interface SignupFormProps extends React.ComponentProps<typeof Card> {
  error: string | null;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  fullName: string;
  setFullName: (value: string) => void;
  role: UserRole;
  setRole: (value: UserRole) => void;
  studentId: string;
  setStudentId: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
}

interface SignupFormProps extends React.ComponentProps<typeof Card> {
  error: string | null;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  fullName: string;
  setFullName: (value: string) => void;
  role: UserRole;
  setRole: (value: UserRole) => void;
  studentId: string;
  setStudentId: (value: string) => void;
  college: string;
  setCollege: (value: string) => void;
  course: string;
  setCourse: (value: string) => void;
  section: string;
  setSection: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
}

export function SignupForm({
  error,
  loading,
  handleSubmit,
  fullName,
  setFullName,
  role,
  setRole,
  studentId,
  setStudentId,
  college,
  setCollege,
  course,
  setCourse,
  section,
  setSection,
  department,
  setDepartment,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  ...props
}: SignupFormProps) {
  const showCollegeFields = role === ROLES.STUDENT || role === ROLES.ADMIN;
  const showDepartmentField = role === ROLES.TEACHER || role === ROLES.ADMIN;

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Juan Delac Cruz"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
            <RoleField role={role} setRole={setRole} />
            {role === ROLES.STUDENT && (
              <StudentIdField
                studentId={studentId}
                setStudentId={setStudentId}
              />
            )}
            {showCollegeFields && (
              <>
                <Field>
                  <FieldLabel htmlFor="college">College</FieldLabel>
                  <Input
                    id="college"
                    type="text"
                    placeholder="College of Computer Studies"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="course">Course</FieldLabel>
                  <Input
                    id="course"
                    type="text"
                    placeholder="BS Computer Science"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="section">Section</FieldLabel>
                  <Input
                    id="section"
                    type="text"
                    placeholder="BSCS-3A"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  />
                </Field>
              </>
            )}
            {showDepartmentField && (
              <Field>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <Input
                  id="department"
                  type="text"
                  placeholder="Computer Science Department"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
