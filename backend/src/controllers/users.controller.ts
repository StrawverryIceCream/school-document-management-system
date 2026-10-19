import { type Request, type Response } from "express";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq, and, ilike, or, count } from "drizzle-orm";
import { recordAuditLog } from "../services/audit.service.js";

interface UpdateUserBody {
  fullName?: string;
  studentId?: string;
  role?: "student" | "teacher" | "admin" | "staff";
  email?: string;
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { search, role, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20),
    );
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.studentId, `%${search}%`),
        ),
      );
    }

    if (role) {
      conditions.push(eq(users.role, role as any));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allUsers, totalResult] = await Promise.all([
      db.query.users.findMany({
        columns: { passwordHash: false },
        where: whereClause,
        orderBy: (users, { desc }) => [desc(users.createdAt)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(users).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
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
      return res.status(400).json({
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

    void recordAuditLog({
      actorId: req.session.userId ?? null,
      action: `Updated account details for ${updatedUser?.fullName ?? id}`,
      entityType: "account",
      entityId: id,
      ipAddress: req.ip,
      metadata: { updatedFields: Object.keys(updateData) },
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("[updateUserById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteUserById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const deletedUsers = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
      });

    if (deletedUsers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    void recordAuditLog({
      actorId: req.session.userId ?? null,
      action: `Deleted user account ${id}`,
      entityType: "account",
      entityId: id,
      ipAddress: req.ip,
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("[deleteUserById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
