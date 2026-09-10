import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

interface SignupBody {
  email: string;
  password: string;
  fullName: string;
  studentId?: string;
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

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

  } catch (err) {
    console.error("[/me] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signup = async (
  req: Request<unknown, unknown, SignupBody>,
  res: Response,
) => {
  const { email, password, fullName, studentId } = req.body;
  if (!email || !password || !fullName) {
    return res
      .status(400)
      .json({ error: "Email, password, and name are required" });
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userData = {
    email,
    passwordHash,
    fullName,
    ...(studentId?.trim() ? { studentId: studentId.trim() } : {}),
  };
  const [user] = await db.insert(users).values(userData).returning();

  if (!user) {
    return res.status(500).json({ error: "Failed to create user" });
  }

  req.session.userId = user.id;
  req.session.save((err) => {
    if (err) return res.status(500).json({ error: "Failed to start session" });
    res.status(201).json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
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
    if (err) return res.status(500).json({ error: "Failed to start session" });
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  });
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.status(204).send();
  });
};

