import crypto from "crypto";
import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { eq, desc, or } from "drizzle-orm";
import { db } from "../db/db.js";
import { users, emailVerifications, courses } from "../db/schema.js";
import { sendOtpEmail } from "../services/email.service.js";
import { recordAuditLog } from "../services/audit.service.js";

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

// One shape for signup, login, and me so they can't drift apart; never includes passwordHash
function toAuthUser(user: DbUser) {
  return {
    id: user.id,
    studentId: user.studentId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    studentStatus: user.studentStatus,
    college: user.collegeId,
    course: user.courseId,
    collegeId: user.collegeId,
    courseId: user.courseId,
    yearLevel: user.yearLevel,
    section: user.section,
    department: user.department,
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

    if (role === "student") {
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
        ...(role === "student"
          ? {
              collegeId: finalCollegeId,
              courseId: finalCourseId,
              studentStatus: studentStatus ?? "regular",
              ...(!isAlumni && yearLevel ? { yearLevel } : {}),
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
      .where(eq(emailVerifications.id, verification.id));


    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    req.session.userId = user.id;
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
      if (user.role !== "student") {
        void recordAuditLog({
          actorId: user.id,
          action: `Signed in (${user.role})`,
          entityType: "account",
          entityId: user.id,
          ipAddress: req.ip,
          metadata: { role: user.role, email: user.email },
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
