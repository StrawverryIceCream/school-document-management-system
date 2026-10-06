import { SignupForm } from "@/components/auth/SignupForm";
import { ModeToggle } from "@/components/ModeToggle";
import { signup } from "@/api/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { STUDENT_ID_PREFIX } from "@/lib/utils";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState(STUDENT_ID_PREFIX);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [department, setDepartment] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await signup({
        email,
        password,
        fullName,
        college,
        course,
        section,
        department,
        // A field left at the bare prefix is sent empty so it is omitted instead of stored as an ID
        studentId: studentId === STUDENT_ID_PREFIX ? "" : studentId,
      });
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-sm">
        <SignupForm
          error={error}
          loading={loading}
          handleSubmit={handleSubmit}
          fullName={fullName}
          setFullName={setFullName}
          studentId={studentId}
          setStudentId={setStudentId}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />
      </div>
    </div>
  );
}

export default Signup;
