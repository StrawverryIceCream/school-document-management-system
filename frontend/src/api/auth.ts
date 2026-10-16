
import type { AuthUser, UserRole } from "@/types";



export interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  department?: string;
  college?: string;
  course?: string;
  collegeId?: string;
  courseId?: string;
  yearLevel?: number;
  section?: string;
  studentId?: string;
  contactNumber?: string;
  role: UserRole;
  otp: string;
}

// Backend errors look like { "error": "..." }, so show that message when there is one
async function getErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const data: { error?: unknown } | null = await res.json().catch(() => null);
  return typeof data?.error === "string" ? data.error : fallback;
}

export async function sendSignupOtp(
  email: string,
): Promise<{ message: string }> {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to send verification code"));
  }
  return res.json();
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Login failed"));
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Logout failed");
}

export async function getCurrentUser(): Promise<AuthUser> {
  const res = await fetch("/api/auth/me", { credentials: "include" });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `/api/auth/me responded ${res.status}`),
    );
  }
  return res.json();
}

export async function signup(payload: SignupPayload): Promise<AuthUser> {
  const { studentId, section, contactNumber, yearLevel, ...required } = payload;

  // Optional fields are only sent when they have a value
  const body = {
    ...required,
    ...(studentId?.trim() ? { studentId: studentId.trim() } : {}),
    ...(section?.trim() ? { section: section.trim() } : {}),
    ...(contactNumber?.trim() ? { contactNumber: contactNumber.trim() } : {}),
    ...(yearLevel !== undefined ? { yearLevel } : {}),
  };

  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Signup failed"));
  return res.json();
}
