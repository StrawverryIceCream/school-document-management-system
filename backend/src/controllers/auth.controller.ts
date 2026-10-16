import crypto from "crypto";
import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { users, emailVerifications } from "../db/schema.js";
import { sendOtpEmail } from "../services/email.service.js";

const BCRYPT_SALT_ROUNDS = 10;
const FIELD_MAX_LENGTH = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  college?: string;
  course?: string;
  section?: string;
  department?: string;
  otp: string;
}

// One shape for signup, login, and me so they can't drift apart; never includes passwordHash
function toAuthUser(user: DbUser) {
  return {
    id: user.id,
    studentId: user.studentId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    college: user.collegeId,
    course: user.courseId,
    section: user.section,
    department: user.department,
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
    if (recent && now.getTime() - recent.createdAt.getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil(
        (60 * 1000 - (now.getTime() - recent.createdAt.getTime())) / 1000,
      );
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting a new code`,
      });
    }

    // Clear older OTPs for this email
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.email, email));

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(emailVerifications).values({
      email,
      otpHash,
      expiresAt,
    });

    await sendOtpEmail(email, otp);

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
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

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
    const { email, password, role } = body;
    const fullName = cleanText(body.fullName);
    const studentId = cleanText(body.studentId);
    const college = cleanText(body.college);
    const course = cleanText(body.course);
    const section = cleanText(body.section);
    const department = cleanText(body.department);
    const otp = cleanText(body.otp);

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password ||
      !fullName
    ) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    if (!isUserRole(role)) {
      return res.status(400).json({ error: "A valid role is required" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return res
        .status(400)
        .json({ error: "A valid 6-digit verification code is required" });
    }

    // Public signup requires placement details.
    if (!college || !course) {
      return res.status(400).json({ error: "College and course are required" });
    }

    const tooLong = [fullName, studentId, college, course, section].some(
      (value) => value !== null && value.length > FIELD_MAX_LENGTH,
    );
    if (tooLong) {
      return res.status(400).json({
        error: `Fields must be at most ${FIELD_MAX_LENGTH} characters`,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

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

    // Verify OTP against email_verifications
    const verification = await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.email, normalizedEmail),
      orderBy: (verifications, { desc: d }) => [d(verifications.createdAt)],
    });

    if (!verification) {
      return res.status(400).json({
        error: "No active verification code found. Please request a new code.",
      });
    }

    if (verification.expiresAt < new Date()) {
      await db
        .delete(emailVerifications)
        .where(eq(emailVerifications.id, verification.id));
      return res.status(400).json({
        error: "Verification code has expired. Please request a new code.",
      });
    }

    if (verification.attempts >= 5) {
      await db
        .delete(emailVerifications)
        .where(eq(emailVerifications.id, verification.id));
      return res.status(400).json({
        error: "Too many failed attempts. Please request a new verification code.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, verification.otpHash);
    if (!isOtpValid) {
      await db
        .update(emailVerifications)
        .set({ attempts: verification.attempts + 1 })
        .where(eq(emailVerifications.id, verification.id));

      const remaining = 5 - (verification.attempts + 1);
      return res.status(400).json({
        error:
          remaining > 0
            ? `Invalid verification code. ${remaining} attempt(s) remaining.`
            : "Invalid verification code. Maximum attempts reached. Please request a new code.",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        fullName,
        role,
        collegeId: college,
        courseId: course,
        emailVerifiedAt: new Date(),
        ...(department ? { department } : {}),
        ...(studentId ? { studentId } : {}),
        ...(section ? { section } : {}),
      })
      .returning();

    // Invalidate consumed OTP
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.id, verification.id));


    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to start session" });
      }
      return res.status(201).json(toAuthUser(user));
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
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password
    ) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to start session" });
      }
      return res.json(toAuthUser(user));
    });
  } catch (err) {
    console.error("[login] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.status(204).send();
  });
};
