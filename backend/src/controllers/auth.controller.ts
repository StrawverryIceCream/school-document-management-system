import crypto from "crypto";
import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { eq, desc, or, and, isNull, lt, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import { users, emailVerifications, courses, passwordResetTokens } from "../db/schema.js";
import { sendOtpEmail, sendPasswordResetOtpEmail, sendLoginOtpEmail } from "../services/email.service.js";
import { recordAuditLog } from "../services/audit.service.js";
import { getActiveAcademicTerm, isLoginTwoFactorEnabled } from "./settings.controller.js";

const BCRYPT_SALT_ROUNDS = 10;
const FIELD_MAX_LENGTH = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_REGEX = /^TUPM-\d{2}-\d{4,5}$/;
const PG_UNIQUE_VIOLATION = "23505";

type DbUser = typeof users.$inferSelect;
type UserRole = DbUser["role"];

const USER_ROLES = [
  "student",
  "teacher",
  "admin",
  "staff",
] as const satisfies readonly UserRole[];

interface SignupBody {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  studentId?: string;
  studentStatus?: "regular" | "irregular" | "graduating" | "alumni";
  college?: string;
  course?: string;
  collegeId?: string;
  courseId?: string;
  yearLevel?: number | string;
  section?: string;
  department?: string;
  contactNumber?: string;
  otp: string;
}

type OrgSummary = { id: string; code: string; name: string };
type AuthDbUser = DbUser & {
  college?: OrgSummary | null;
  course?: OrgSummary | null;
  officeRecord?: OrgSummary | null;
};

const AUTH_USER_WITH = {
  college: { columns: { id: true, code: true, name: true } },
  course: { columns: { id: true, code: true, name: true } },
  officeRecord: { columns: { id: true, code: true, name: true } },
} as const;

// One shape for signup, login, and me so they can't drift apart; never includes passwordHash
function toAuthUser(user: AuthDbUser) {
  return {
    id: user.id,
    studentId: user.studentId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    studentStatus: user.studentStatus,
    college: user.college ?? null,
    course: user.course ?? null,
    officeRecord: user.officeRecord ?? null,
    collegeId: user.collegeId,
    courseId: user.courseId,
    yearLevel: user.yearLevel,
    section: user.section,
    department: user.department,
    office: user.office,
    officeId: user.officeId,
    verifiedAcademicTerm: user.verifiedAcademicTerm ?? null,
    contactNumber: user.contactNumber,
  };
}

function cleanText(value: unknown): string | null {
  return typeof value === "string" ? value.trim() || null : null;
}

function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}

// Drizzle may wrap the driver error, so check the cause chain too
function hasPgErrorCode(err: unknown, code: string): boolean {
  if (typeof err !== "object" || err === null) return false;
  const { code: errCode, cause } = err as { code?: unknown; cause?: unknown };
  if (errCode === code) return true;
  return hasPgErrorCode(cause, code);
}

export type LoginOtpState = "bypass" | "challenge" | "verify";
export type LoginChallengeAction = "send" | "reuse" | "rate_limit";

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function evaluateLoginOtpState(options: {
  twoFactorEnabled: boolean;
  otp?: unknown;
  resend?: unknown;
}): LoginOtpState {
  if (!options.twoFactorEnabled) return "bypass";
  if (options.resend === true) return "challenge";
  const otp = typeof options.otp === "string" ? options.otp.trim() : "";
  return otp ? "verify" : "challenge";
}

export function decideLoginChallengeAction(options: {
  cooldownActive: boolean;
  isResend: boolean;
  hasRecent: boolean;
  expired: boolean;
  attempts: number;
}): LoginChallengeAction {
  if (!options.cooldownActive) return "send";
  if (options.isResend || (options.hasRecent && options.attempts >= 5)) {
    return "rate_limit";
  }
  if (options.hasRecent && !options.expired) {
    return "reuse";
  }
  return "send";
}

export interface EmailVerificationRecordLike {
  otpHash: string;
  expiresAt: Date | string;
  attempts: number;
}

export type LoginOtpVerificationResult =
  | { ok: true }
  | {
      ok: false;
      status: 400;
      error: string;
      shouldDelete?: boolean;
      nextAttempts?: number;
    };

export async function checkLoginOtpVerification(input: {
  verification: EmailVerificationRecordLike | null | undefined;
  otp: string;
  now?: Date;
}): Promise<LoginOtpVerificationResult> {
  const { verification, otp, now = new Date() } = input;
  if (!verification) {
    return {
      ok: false,
      status: 400,
      error: "No active verification code found. Please request a new code.",
    };
  }
  if (new Date(verification.expiresAt) <= now) {
    return {
      ok: false,
      status: 400,
      error: "Verification code has expired. Please request a new code.",
      shouldDelete: true,
    };
  }
  if (verification.attempts >= 5) {
    return {
      ok: false,
      status: 400,
      error: "Too many failed attempts. Please request a new verification code.",
      shouldDelete: true,
    };
  }
  const isOtpValid = await bcrypt.compare(otp, verification.otpHash);
  if (!isOtpValid) {
    const nextAttempts = verification.attempts + 1;
    const remaining = 5 - nextAttempts;
    return {
      ok: false,
      status: 400,
      error:
        remaining > 0
          ? `Invalid verification code. ${remaining} attempt(s) remaining.`
          : "Invalid verification code. Maximum attempts reached. Please request a new code.",
      nextAttempts,
    };
  }
  return { ok: true };
}

async function verifyStoredEmailOtp(
  normalizedEmail: string,
  otp: string,
): Promise<
  | { ok: true; verificationId: string }
  | { ok: false; status: 400; error: string }
> {
  const verification = await db.query.emailVerifications.findFirst({
    where: eq(emailVerifications.email, normalizedEmail),
    orderBy: (verifications, { desc: d }) => [d(verifications.createdAt)],
  });

  const otpCheck = await checkLoginOtpVerification({ verification, otp });
  if (!otpCheck.ok || !verification) {
    if (!otpCheck.ok && otpCheck.shouldDelete && verification) {
      await db
        .delete(emailVerifications)
        .where(eq(emailVerifications.id, verification.id));
    } else if (!otpCheck.ok && otpCheck.nextAttempts !== undefined && verification) {
      await db
        .update(emailVerifications)
        .set({ attempts: sql`${emailVerifications.attempts} + 1` })
        .where(
          and(
            eq(emailVerifications.id, verification.id),
            lt(emailVerifications.attempts, 5),
          ),
        );
    }
    return !otpCheck.ok
      ? { ok: false, status: otpCheck.status, error: otpCheck.error }
      : {
          ok: false,
          status: 400,
          error: "No active verification code found. Please request a new code.",
        };
  }

  return { ok: true, verificationId: verification.id };
}

export const sendSignupOtp = async (req: Request, res: Response) => {
  try {
    const rawEmail = req.body?.email;
    if (
      typeof rawEmail !== "string" ||
      !rawEmail.trim() ||
      !EMAIL_REGEX.test(rawEmail.trim())
    ) {
      return res
        .status(400)
        .json({ error: "A valid email address is required" });
    }

    const email = rawEmail.trim().toLowerCase();

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Rate limiting cooldown: 60 seconds
    const recent = await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.email, email),
      orderBy: (verifications, { desc: d }) => [d(verifications.createdAt)],
    });

    const now = new Date();
    if (recent && now.getTime() - new Date(recent.createdAt).getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil(
        (60 * 1000 - (now.getTime() - new Date(recent.createdAt).getTime())) / 1000,
      );
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting a new code`,
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Deliver email before recording verification row so delivery failures never trigger false cooldowns
    try {
      await sendOtpEmail(email, otp);
    } catch (sendErr) {
      console.error("[sendSignupOtp] Failed to deliver verification email:", sendErr);
      return res.status(502).json({
        error: "Failed to deliver verification email. Please check your email address or try again.",
      });
    }

    // Clear older OTPs for this email and record the active verification
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.email, email));

    await db.insert(emailVerifications).values({
      email,
      otpHash,
      expiresAt,
    });

    return res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("[sendSignupOtp] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: AUTH_USER_WITH,
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.isActive) {
      req.session.destroy(() => {});
      return res.status(403).json({ error: "Account has been suspended" });
    }

    return res.json(toAuthUser(user));
  } catch (err) {
    console.error("[/me] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signup = async (
  req: Request<unknown, unknown, SignupBody>,
  res: Response,
) => {
  try {
    const body: Partial<SignupBody> = req.body ?? {};
    const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;
    const fullName = cleanText(body.fullName);
    const rawStudentId = cleanText(body.studentId);
    const studentId = rawStudentId ? rawStudentId.toUpperCase() : null;
    const rawStudentStatus = cleanText(body.studentStatus);
    const validStudentStatuses = ["regular", "irregular", "graduating", "alumni"] as const;
    const studentStatus = validStudentStatuses.includes(rawStudentStatus as any)
      ? (rawStudentStatus as (typeof validStudentStatuses)[number])
      : undefined;
    const effectiveCollegeId = cleanText(body.collegeId) || cleanText(body.college);
    const effectiveCourseId = cleanText(body.courseId) || cleanText(body.course);
    const section = cleanText(body.section);
    const department = cleanText(body.department);
    const contactNumber = cleanText(body.contactNumber);
    const rawYearLevel = body.yearLevel;
    const yearLevel =
      rawYearLevel !== undefined && rawYearLevel !== null && rawYearLevel !== ""
        ? parseInt(String(rawYearLevel), 10)
        : undefined;
    const otp = cleanText(body.otp);
    const isAlumni = role === "student" && studentStatus === "alumni";

    if (
      !rawEmail ||
      !password ||
      !fullName
    ) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    if (!isUserRole(role) || (role !== "student" && role !== "teacher")) {
      return res.status(400).json({
        error: "Self-registration is only permitted for students and faculty",
      });
    }

    if (!EMAIL_REGEX.test(rawEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const normalizedEmail = rawEmail.toLowerCase();

    if (!otp || !/^\d{6}$/.test(otp)) {
      return res
        .status(400)
        .json({ error: "A valid 6-digit verification code is required" });
    }

    if (role === "student") {
      if (studentId && !STUDENT_ID_REGEX.test(studentId)) {
        return res.status(400).json({
          error: "Student ID must follow the format TUPM-XX-XXXX or TUPM-XX-XXXXX",
        });
      }
      if (!effectiveCourseId) {
        return res
          .status(400)
          .json({ error: "College and degree program are required for students" });
      }
      if (
        !isAlumni &&
        yearLevel !== undefined &&
        (isNaN(yearLevel) || yearLevel < 1 || yearLevel > 6)
      ) {
        return res
          .status(400)
          .json({ error: "Year level must be between 1 and 6" });
      }
    } else if (role === "teacher") {
      if (!department) {
        return res
          .status(400)
          .json({ error: "Department is required for faculty" });
      }
    }

    const tooLong = [
      fullName,
      studentId,
      effectiveCollegeId,
      effectiveCourseId,
      section,
      contactNumber,
      department,
    ].some((value) => value !== null && value.length > FIELD_MAX_LENGTH);
    if (tooLong) {
      return res.status(400).json({
        error: `Fields must be at most ${FIELD_MAX_LENGTH} characters`,
      });
    }

    if (contactNumber && !/^\d{11}$/.test(contactNumber)) {
      return res.status(400).json({
        error: "Contact number must be exactly 11 digits",
      });
    }


    const existing = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: { id: true },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    if (studentId) {
      const studentIdExists = await db.query.users.findFirst({
        where: eq(users.studentId, studentId),
        columns: { id: true },
      });

      if (studentIdExists) {
        return res.status(409).json({ error: "Student ID already in use" });
      }
    }

    // Resolve course and college IDs for student placement
    let finalCollegeId: string | null = null;
    let finalCourseId: string | null = null;

    if (role === "student" && effectiveCourseId) {
      const courseRecord = await db.query.courses.findFirst({
        where: or(
          eq(courses.id, effectiveCourseId),
          eq(courses.code, effectiveCourseId),
        ),
      });

      if (courseRecord) {
        finalCourseId = courseRecord.id;
        finalCollegeId = courseRecord.collegeId;
      } else {
        finalCourseId = effectiveCourseId;
        finalCollegeId = effectiveCollegeId ?? null;
      }
    }

    // Verify OTP against email_verifications
    const otpResult = await verifyStoredEmailOtp(normalizedEmail, otp);
    if (!otpResult.ok) {
      return res.status(otpResult.status).json({ error: otpResult.error });
    }

    const activeAcademicTerm = role === "student" ? await getActiveAcademicTerm() : null;
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        fullName,
        role,
        ...(role === "student"
          ? {
              collegeId: finalCollegeId,
              courseId: finalCourseId,
              studentStatus: studentStatus ?? "regular",
              ...(!isAlumni && yearLevel ? { yearLevel } : {}),
              verifiedAcademicTerm: activeAcademicTerm,
            }
          : {}),
        emailVerifiedAt: new Date(),
        ...(department && role === "teacher" ? { department } : {}),
        ...(studentId ? { studentId } : {}),
        ...(section ? { section } : {}),
        ...(contactNumber ? { contactNumber } : {}),
      })
      .returning();

    // Invalidate consumed OTP
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.id, otpResult.verificationId));


    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const hydratedUser =
      (await db.query.users.findFirst({
        where: eq(users.id, user.id),
        with: AUTH_USER_WITH,
      })) ?? user;

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.officeId = user.officeId ?? null;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to start session" });
      }
      void recordAuditLog({
        actorId: user.id,
        action: `Registered account (${user.role})`,
        entityType: "account",
        entityId: user.id,
        ipAddress: req.ip,
        metadata: { role: user.role, email: user.email },
      });
      return res.status(201).json(toAuthUser(hydratedUser));
    });
  } catch (err) {
    // Safety net for a race between the duplicate checks and the insert
    if (hasPgErrorCode(err, PG_UNIQUE_VIOLATION)) {
      return res
        .status(409)
        .json({ error: "Email or student ID already in use" });
    }

    console.error("[signup] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, otp, resend } = req.body ?? {};

    const normalizedInputEmail =
      typeof email === "string" ? normalizeLoginEmail(email) : "";
    if (!normalizedInputEmail || typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db.query.users.findFirst({
      where: sql`lower(trim(${users.email})) = ${normalizedInputEmail}`,
      with: AUTH_USER_WITH,
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: "Account has been suspended. Please contact an administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const twoFactorEnabled = await isLoginTwoFactorEnabled();
    const otpState = evaluateLoginOtpState({ twoFactorEnabled, otp, resend });
    const normalizedEmail = normalizeLoginEmail(user.email);

    if (otpState === "challenge") {
      const now = new Date();
      const recent = await db.query.emailVerifications.findFirst({
        where: eq(emailVerifications.email, normalizedEmail),
        orderBy: (verifications, { desc: d }) => [d(verifications.createdAt)],
      });

      const cooldown = recent
        ? calculateRecoveryCooldown(recent.createdAt, now)
        : { active: false, waitSeconds: 0 };

      const challengeAction = decideLoginChallengeAction({
        cooldownActive: cooldown.active,
        isResend: resend === true,
        hasRecent: Boolean(recent),
        expired: recent ? isTokenExpired(recent.expiresAt, now) : true,
        attempts: recent?.attempts ?? 0,
      });

      if (challengeAction === "rate_limit") {
        return res.status(429).json({
          error: `Please wait ${cooldown.waitSeconds} seconds before requesting a new code`,
        });
      }

      if (challengeAction === "reuse") {
        return res.json({
          requiresTwoFactor: true,
          email: user.email,
          message: "Verification code sent to your email",
        });
      }

      const code = crypto.randomInt(100000, 1000000).toString();
      const otpHash = await bcrypt.hash(code, BCRYPT_SALT_ROUNDS);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      try {
        await sendLoginOtpEmail(user.email, code);
      } catch (sendErr) {
        console.error("[login] Failed to deliver 2FA email:", sendErr);
        return res.status(502).json({
          error:
            "Failed to deliver two-factor verification email. Please try again later.",
        });
      }

      await db
        .delete(emailVerifications)
        .where(eq(emailVerifications.email, normalizedEmail));

      await db.insert(emailVerifications).values({
        email: normalizedEmail,
        otpHash,
        expiresAt,
      });

      return res.json({
        requiresTwoFactor: true,
        email: user.email,
        message: "Verification code sent to your email",
      });
    }

    if (otpState === "verify") {
      const cleanOtp = typeof otp === "string" ? otp.trim() : "";
      if (!validateOtpCode(cleanOtp)) {
        return res
          .status(400)
          .json({ error: "A valid 6-digit verification code is required" });
      }

      const otpResult = await verifyStoredEmailOtp(normalizedEmail, cleanOtp);
      if (!otpResult.ok) {
        return res.status(otpResult.status).json({ error: otpResult.error });
      }

      // Single-use claim so concurrent login requests cannot consume the same OTP twice
      const [consumed] = await db
        .delete(emailVerifications)
        .where(eq(emailVerifications.id, otpResult.verificationId))
        .returning({ id: emailVerifications.id });
      if (!consumed) {
        return res.status(400).json({
          error: "No active verification code found. Please request a new code.",
        });
      }
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.officeId = user.officeId ?? null;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to start session" });
      }
      if (user.role !== "student") {
        void recordAuditLog({
          actorId: user.id,
          action: `Signed in (${user.role})`,
          entityType: "account",
          entityId: user.id,
          ipAddress: req.ip,
          metadata: {
            role: user.role,
            email: user.email,
            ...(twoFactorEnabled ? { twoFactorVerified: true } : {}),
          },
        });
      }
      return res.json(toAuthUser(user));
    });
  } catch (err) {
    console.error("[login] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true, email: true },
    });
    if (user && user.role !== "student") {
      void recordAuditLog({
        actorId: userId,
        action: `Signed out (${user.role})`,
        entityType: "account",
        entityId: userId,
        ipAddress: req.ip,
      });
    }
  }
  req.session.destroy(() => {
    res.status(204).send();
  });
};

export function validateRecoveryEmail(rawEmail: unknown): {
  valid: boolean;
  normalized?: string;
  error?: string;
} {
  if (
    typeof rawEmail !== "string" ||
    !rawEmail.trim() ||
    !EMAIL_REGEX.test(rawEmail.trim())
  ) {
    return { valid: false, error: "A valid email address is required" };
  }
  return { valid: true, normalized: rawEmail.trim().toLowerCase() };
}

export function validateOtpCode(otp: unknown): boolean {
  return typeof otp === "string" && /^\d{6}$/.test(otp);
}

export function validateRecoveryPassword(password: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof password !== "string" || password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  return { valid: true };
}

export function calculateRecoveryCooldown(
  createdAt: Date | string,
  now: Date = new Date(),
): { active: boolean; waitSeconds: number } {
  const createdMs = new Date(createdAt).getTime();
  const diffMs = now.getTime() - createdMs;
  if (diffMs < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
    return { active: true, waitSeconds };
  }
  return { active: false, waitSeconds: 0 };
}

export function isTokenExpired(
  expiresAt: Date | string,
  now: Date = new Date(),
): boolean {
  return new Date(expiresAt).getTime() <= now.getTime();
}

export const sendForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const emailResult = validateRecoveryEmail(req.body?.email);
    if (!emailResult.valid || !emailResult.normalized) {
      return res
        .status(400)
        .json({ error: emailResult.error || "A valid email address is required" });
    }

    const email = emailResult.normalized;
    const genericResponse = {
      message:
        "If an account with this email exists, a password recovery code has been sent.",
    };

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true, email: true },
    });

    // Anti-enumeration defense: respond 200 without disclosing whether user exists
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Cooldown verification (60s)
    const recent = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.userId, user.id),
      orderBy: (tokens, { desc: d }) => [d(tokens.createdAt)],
    });

    const now = new Date();
    if (recent) {
      const cooldown = calculateRecoveryCooldown(recent.createdAt, now);
      if (cooldown.active) {
        return res.status(429).json({
          error: `Please wait ${cooldown.waitSeconds} seconds before requesting a new code`,
        });
      }
    }

    // Generate 6-digit OTP and bcrypt hash
    const otp = crypto.randomInt(100000, 1000000).toString();
    const tokenHash = await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    // Send email via Brevo or dev console fallback
    try {
      await sendPasswordResetOtpEmail(email, otp);
    } catch (sendErr) {
      console.error(
        "[sendForgotPasswordOtp] Failed to deliver recovery email:",
        sendErr,
      );
      return res.status(502).json({
        error: "Failed to deliver recovery email. Please try again later.",
      });
    }

    // Invalidate existing active tokens and insert new record
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("[sendForgotPasswordOtp] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const emailResult = validateRecoveryEmail(req.body?.email);
    if (!emailResult.valid || !emailResult.normalized) {
      return res
        .status(400)
        .json({ error: emailResult.error || "A valid email address is required" });
    }

    const { otp } = req.body ?? {};
    if (!validateOtpCode(otp)) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    const email = emailResult.normalized;
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    const tokenRecord = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.userId, user.id),
        isNull(passwordResetTokens.usedAt),
      ),
      orderBy: (tokens, { desc: d }) => [d(tokens.createdAt)],
    });

    const now = new Date();
    if (!tokenRecord || isTokenExpired(tokenRecord.expiresAt, now)) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    const isValidOtp = await bcrypt.compare(otp, tokenRecord.tokenHash);
    if (!isValidOtp) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    return res.status(200).json({
      valid: true,
      message: "Recovery code verified successfully",
    });
  } catch (error) {
    console.error("[verifyForgotPasswordOtp] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const emailResult = validateRecoveryEmail(req.body?.email);
    if (!emailResult.valid || !emailResult.normalized) {
      return res
        .status(400)
        .json({ error: emailResult.error || "A valid email address is required" });
    }

    const { otp, newPassword } = req.body ?? {};

    if (!validateOtpCode(otp)) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    const passwordResult = validateRecoveryPassword(newPassword);
    if (!passwordResult.valid) {
      return res.status(400).json({ error: passwordResult.error });
    }

    const email = emailResult.normalized;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true, email: true },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    const tokenRecord = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.userId, user.id),
        isNull(passwordResetTokens.usedAt),
      ),
      orderBy: (tokens, { desc: d }) => [d(tokens.createdAt)],
    });

    const now = new Date();
    if (!tokenRecord || isTokenExpired(tokenRecord.expiresAt, now)) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    // Verify OTP hash
    const isValidOtp = await bcrypt.compare(otp, tokenRecord.tokenHash);
    if (!isValidOtp) {
      return res.status(400).json({ error: "Invalid or expired recovery code" });
    }

    // Update password hash
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, user.id));

    // Invalidate token to prevent replay
    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return res.status(200).json({
      message:
        "Password reset successful. You may now log in with your new password.",
    });
  } catch (error) {
    console.error("[resetPasswordWithOtp] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
