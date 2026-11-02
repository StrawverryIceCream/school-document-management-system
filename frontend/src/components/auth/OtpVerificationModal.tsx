import { useState, useEffect } from "react";
import { Loader2, MailCheck, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpVerificationModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading: boolean;
}

export default function OtpVerificationModal({
  open,
  email,
  onClose,
  onVerify,
  onResend,
  loading,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  function handleClose() {
    setOtp("");
    setError(null);
    setResendCooldown(60);
    onClose();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = otp.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError("Please enter the 6-digit numeric verification code");
      return;
    }

    try {
      await onVerify(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResending(true);
    try {
      await onResend();
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !loading && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-start">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
            <MailCheck className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold">Verify Your Email</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-foreground">{email}</span>. Please enter
            it below to complete your registration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="otp-input" className="sr-only">
              6-digit verification code
            </Label>
            <Input
              id="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              autoFocus
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(val);
                if (error) setError(null);
              }}
              className="h-12 text-center font-mono text-2xl font-bold tracking-[0.4em]"
              disabled={loading}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "otp-error" : undefined}
            />
          </div>

          {error && (
            <p
              id="otp-error"
              role="alert"
              aria-live="assertive"
              className="text-center text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Didn't receive the email?</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={resendCooldown > 0 || resending || loading}
              onClick={handleResend}
              className="h-auto p-0 text-xs font-semibold text-primary hover:bg-transparent hover:underline"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-1 size-3 animate-spin motion-reduce:animate-none" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                <span className="flex items-center gap-1">
                  <RotateCcw className="size-3" /> Resend Code
                </span>
              )}
            </Button>
          </div>

          <DialogFooter className="pt-2 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || otp.length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                  Verifying...
                </>
              ) : (
                "Verify & Create Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
