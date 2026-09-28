import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";

const BCRYPT_SALT_ROUNDS = 10;
const FIELD_MAX_LENGTH = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PG_UNIQUE_VIOLATION = "23505";

type DbUser = typeof users.$inferSelect;

interface SignupBody {
  email: string;
  password: string;
  fullName: string;
  studentId?: string;
  college?: string;
  course?: string;
  section?: string;
}

// One shape for signup, login, and me so they can't drift apart; never includes passwordHash
function toAuthUser(user: DbUser) {
  return {
    id: user.id,
    studentId: user.studentId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    college: user.college,
    course: user.course,
    section: user.section,
    department: user.department,
  };
}

function cleanText(value: unknown): string | null {
  return typeof value === "string" ? value.trim() || null : null;
}

// Drizzle may wrap the driver error, so check the cause chain too
function hasPgErrorCode(err: unknown, code: string): boolean {
  if (typeof err !== "object" || err === null) return false;
  const { code: errCode, cause } = err as { code?: unknown; cause?: unknown };
  if (errCode === code) return true;
  return hasPgErrorCode(cause, code);
}

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
    const { email, password } = body;
    const fullName = cleanText(body.fullName);
    const studentId = cleanText(body.studentId);
    const college = cleanText(body.college);
    const course = cleanText(body.course);
    const section = cleanText(body.section);

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

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Public signup only creates students, so placement is required here
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

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
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

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Role is never read from the body, so it always falls back to the "student" default
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        fullName,
        college,
        course,
        ...(studentId ? { studentId } : {}),
        ...(section ? { section } : {}),
      })
      .returning();

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
