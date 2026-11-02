import LoginCard from "@/components/auth/LoginCard";
import LoginFooter from "@/components/auth/LoginFooter";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginIntro from "@/components/auth/LoginIntro";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch {
      setError(
        "Invalid credentials. Please verify your email and password, or contact the university registrar if you need assistance.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LoginHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:pr-6">
            <LoginIntro />
          </div>
          <div className="lg:col-span-7">
            <LoginCard
              error={error}
              loading={loading}
              handleSubmit={handleSubmit}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          </div>
        </div>
      </main>
      <LoginFooter />
    </div>
  );
}

export default Login;
