import { isTwoFactorChallenge, login as apiLogin } from "@/api/auth";
import LoginCard from "@/components/auth/LoginCard";
import LoginFooter from "@/components/auth/LoginFooter";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginIntro from "@/components/auth/LoginIntro";
import OtpVerificationModal from "@/components/auth/OtpVerificationModal";
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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      if (isTwoFactorChallenge(result)) {
        setTwoFactorEmail(result.email);
        setShowOtpModal(true);
        return;
      }
      navigate("/home");
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Invalid credentials"
          ? err.message
          : "Invalid credentials. Please verify your email and password, or contact the university registrar if you need assistance.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(otp: string) {
    setVerifyingOtp(true);
    try {
      const result = await login(twoFactorEmail || email, password, otp);
      if (!isTwoFactorChallenge(result)) {
        setShowOtpModal(false);
        setTwoFactorEmail("");
        navigate("/home");
      }
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleResendOtp() {
    await apiLogin(twoFactorEmail || email, password, { resend: true });
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

      <OtpVerificationModal
        key={`${showOtpModal}-${twoFactorEmail}`}
        open={showOtpModal}
        email={twoFactorEmail}
        onClose={() => {
          setShowOtpModal(false);
          setTwoFactorEmail("");
        }}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        loading={verifyingOtp}
        title="Two-Factor Authentication"
        description="Please enter it below to complete your sign-in."
        submitLabel="Verify & Sign In"
      />
    </div>
  );
}

export default Login;
