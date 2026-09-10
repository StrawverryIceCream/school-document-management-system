import { type Request, type Response } from "express";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

interface UpdateUserBody {
  fullName?: string;
  studentId?: string;
  role?: "student" | "teacher" | "admin" | "staff";
  email?: string;
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        passwordHash: false,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    res.json(allUsers);
  } catch (err) {
    console.error("[getAllUsers] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserById(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false, // Exclude password hash from response
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("[getUserById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateUserById(
  req: Request<{ id: string }, unknown, UpdateUserBody>,
  res: Response,
) {
  try {
    const { id } = req.params;
    const { fullName, studentId, role, email } = req.body;

    if (!fullName && !studentId && !role && !email) {
      return res
        .status(400)
        .json({ error: "At least one field must be provided for update" });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const emailExists = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (emailExists && emailExists.id !== id) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    if (studentId) {
      const studentIdExists = await db.query.users.findFirst({
        where: eq(users.studentId, studentId),
      });

      if (studentIdExists && studentIdExists.id !== id) {
        return res.status(409).json({ error: "Student ID already in use" });
      }
    }

    const validRoles = ["student", "teacher", "admin", "staff"];
    if (role && !validRoles.includes(role)) {
      return res
        .status(400)
        .json({
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        });
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) updateData.email = email;

    await db.update(users).set(updateData).where(eq(users.id, id));

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false,
      },
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("[updateUserById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
