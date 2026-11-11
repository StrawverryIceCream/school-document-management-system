const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRecoveryEmail(email: unknown): {
  valid: boolean;
  normalized?: string;
  error?: string;
} {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    !EMAIL_REGEX.test(email.trim())
  ) {
    return { valid: false, error: "A valid email address is required" };
  }
  return { valid: true, normalized: email.trim().toLowerCase() };
}

export function validateRecoveryOtp(otp: unknown): boolean {
  return typeof otp === "string" && /^\d{6}$/.test(otp.trim());
}

export function validateRecoveryPasswordPair(
  password: unknown,
  confirmPassword: unknown,
): { valid: boolean; error?: string } {
  if (typeof password !== "string" || password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters",
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      error: "Passwords do not match",
    };
  }

  return { valid: true };
}

export function formatCooldownCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

