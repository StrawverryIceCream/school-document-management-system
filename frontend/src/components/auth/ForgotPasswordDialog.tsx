import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatCooldownCountdown,
  validateRecoveryEmail,
  validateRecoveryOtp,
  validateRecoveryPasswordPair,
} from "@/lib/auth/forgot-password";
import {
  resetPasswordWithOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "@/api/auth";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string;
  onSuccess: (email: string) => void;
}

type RecoveryStep = "email" | "otp" | "password";

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  initialEmail = "",
  onSuccess,
}: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Sync initial email when modal opens
  useEffect(() => {
    if (open) {
      if (initialEmail && !email) {
        setEmail(initialEmail);
      }
      setError(null);
    } else {
      // Reset state when closed
      setStep("email");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open, initialEmail]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function handleSendCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    const emailCheck = validateRecoveryEmail(email);
    if (!emailCheck.valid || !emailCheck.normalized) {
      setError(emailCheck.error || "A valid email address is required");
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordOtp(emailCheck.normalized);
      setEmail(emailCheck.normalized);
      setStep("otp");
      setCooldown(60);
      toast.success("Recovery code dispatched", {
        description: "Check your inbox for the 6-digit verification code.",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send recovery code",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateRecoveryOtp(otp)) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      await verifyForgotPasswordOtp(email, otp);
      setStep("password");
      toast.success("Code verified", {
        description: "Please enter your new password.",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid or expired recovery code",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const passwordCheck = validateRecoveryPasswordPair(
      newPassword,
      confirmPassword,
    );
    if (!passwordCheck.valid) {
      setError(passwordCheck.error || "Please verify your new password");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      toast.success("Password reset successful", {
        description: "You can now log in with your new password.",
      });
      onSuccess(email);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-6 bg-card text-card-foreground rounded-2xl shadow-2xl">
        <DialogHeader className="gap-1.5 text-start">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            {step === "password" ? (
              <Lock className="size-5" aria-hidden="true" />
            ) : step === "otp" ? (
              <ShieldCheck className="size-5" aria-hidden="true" />
            ) : (
              <KeyRound className="size-5" aria-hidden="true" />
            )}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {step === "email" && "Recover Your Password"}
            {step === "otp" && "Verify Recovery Code"}
            {step === "password" && "Set New Password"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {step === "email" &&
              "Enter your registered institutional email to receive a 6-digit recovery code."}
            {step === "otp" &&
              `Enter the 6-digit code sent to ${email} to verify your identity.`}
            {step === "password" &&
              `Code verified. Create a strong password with at least 8 characters for ${email}.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1 leading-normal">{error}</span>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label
                htmlFor="recovery-email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="h-10 ps-10 rounded-lg text-sm"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-10 gap-2 rounded-lg text-sm font-semibold cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send Recovery Code
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="recovery-otp"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  6-Digit Verification Code
                </Label>
                {cooldown > 0 ? (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Resend in {formatCooldownCountdown(cooldown)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleSendCode()}
                    disabled={loading}
                    className="text-[11px] font-medium text-primary hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </div>
              <Input
                id="recovery-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="h-11 rounded-lg text-center font-mono text-lg tracking-[0.35em] font-bold"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("email");
                  setError(null);
                }}
                className="h-10 gap-1.5 rounded-lg px-3 text-xs cursor-pointer"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Change Email
              </Button>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 h-10 gap-2 rounded-lg text-sm font-semibold cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label
                htmlFor="recovery-new-password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                New Password (8+ characters)
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="recovery-new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-10 ps-10 pe-10 rounded-lg text-sm"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute end-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="recovery-confirm-password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="recovery-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="h-10 ps-10 pe-10 rounded-lg text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute end-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("otp");
                  setError(null);
                }}
                className="h-10 gap-1.5 rounded-lg px-3 text-xs cursor-pointer"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Back
              </Button>

              <Button
                type="submit"
                disabled={
                  loading ||
                  newPassword.length < 8 ||
                  !confirmPassword
                }
                className="flex-1 h-10 gap-2 rounded-lg text-sm font-semibold cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Set New Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPasswordDialog;
