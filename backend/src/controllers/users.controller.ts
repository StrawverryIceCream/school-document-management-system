import { type Request, type Response } from "express";
import { db } from "../db/db.js";
import { users, offices } from "../db/schema.js";
import { eq, and, ilike, or, count, inArray } from "drizzle-orm";
import { recordAuditLog } from "../services/audit.service.js";

interface UpdateUserBody {
  fullName?: string;
  studentId?: string | null;
  role?: "student" | "teacher" | "admin" | "staff";
  email?: string;
  isActive?: boolean;
  collegeId?: string | null;
  courseId?: string | null;
  section?: string | null;
  yearLevel?: number | null;
  studentStatus?: "regular" | "irregular" | "graduating" | "alumni" | null;
  department?: string | null;
  office?: "registrar" | "hr" | null;
  officeId?: string | null;
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

    if (search && typeof search === "string" && search.trim()) {
      const searchPattern = `%${search.trim()}%`;

      const matchingOffices = await db
        .select({ id: offices.id })
        .from(offices)
        .where(
          or(
            ilike(offices.code, searchPattern),
            ilike(offices.name, searchPattern),
          ),
        );

      const matchingOfficeIds = matchingOffices.map((o) => o.id);

      const searchConditions = [
        ilike(users.fullName, searchPattern),
        ilike(users.email, searchPattern),
        ilike(users.studentId, searchPattern),
        ilike(users.department, searchPattern),
      ];

      if (matchingOfficeIds.length > 0) {
        searchConditions.push(inArray(users.officeId, matchingOfficeIds));
      }

      conditions.push(or(...searchConditions));
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
    const {
      fullName,
      studentId,
      role,
      email,
      isActive,
      department,
      officeId,
      office,
      collegeId,
      courseId,
      section,
      yearLevel,
      studentStatus,
    } = req.body;

    const hasAnyField = [
      fullName,
      studentId,
      role,
      email,
      isActive,
      department,
      officeId,
      office,
      collegeId,
      courseId,
      section,
      yearLevel,
      studentStatus,
    ].some((f) => f !== undefined);

    if (!hasAnyField) {
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

    const targetRole = role ?? existingUser.role;
    const updateData: any = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (targetRole === "staff") {
      const rawOfficeId = officeId !== undefined ? officeId : existingUser.officeId;
      const rawOffice = office !== undefined ? office : existingUser.office;

      if (!rawOfficeId && !rawOffice) {
        return res
          .status(400)
          .json({ error: "Staff role requires an assigned office" });
      }

      let resolvedOffice = null;
      if (rawOfficeId) {
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            rawOfficeId,
          );
        if (isUuid) {
          resolvedOffice = await db.query.offices.findFirst({
            where: eq(offices.id, rawOfficeId),
          });
        } else {
          resolvedOffice = await db.query.offices.findFirst({
            where: or(
              ilike(offices.code, rawOfficeId),
              ilike(offices.name, `%${rawOfficeId}%`),
            ),
          });
        }
      }

      if (!resolvedOffice && rawOffice) {
        const legacyCode = rawOffice === "registrar" ? "OUR" : "HRMO";
        resolvedOffice = await db.query.offices.findFirst({
          where: eq(offices.code, legacyCode),
        });
      }

      if (!resolvedOffice) {
        return res.status(400).json({
          error: `Assigned office "${rawOfficeId || rawOffice}" could not be found.`,
        });
      }

      updateData.officeId = resolvedOffice.id;
      updateData.office =
        resolvedOffice.code === "OUR"
          ? "registrar"
          : resolvedOffice.code === "HRMO"
            ? "hr"
            : null;

      // Clear student and teacher credentials
      updateData.studentId = null;
      updateData.collegeId = null;
      updateData.courseId = null;
      updateData.section = null;
      updateData.yearLevel = null;
      updateData.studentStatus = null;
      updateData.department = null;
    } else if (targetRole === "teacher") {
      updateData.department = department !== undefined ? department : existingUser.department;
      // Clear staff and student credentials
      updateData.office = null;
      updateData.officeId = null;
      updateData.studentId = null;
      updateData.collegeId = null;
      updateData.courseId = null;
      updateData.section = null;
      updateData.yearLevel = null;
      updateData.studentStatus = null;
    } else if (targetRole === "student") {
      if (studentId !== undefined) updateData.studentId = studentId;
      if (collegeId !== undefined) updateData.collegeId = collegeId;
      if (courseId !== undefined) updateData.courseId = courseId;
      if (section !== undefined) updateData.section = section;
      if (yearLevel !== undefined) updateData.yearLevel = yearLevel;
      if (studentStatus !== undefined) updateData.studentStatus = studentStatus;
      // Clear staff and teacher credentials
      updateData.office = null;
      updateData.officeId = null;
      updateData.department = null;
    } else if (targetRole === "admin") {
      updateData.office = null;
      updateData.officeId = null;
      updateData.studentId = null;
      updateData.department = null;
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false,
      },
    });

    const actionLabel =
      isActive === false
        ? `Suspended account for ${updatedUser?.fullName ?? id}`
        : isActive === true
          ? `Activated account for ${updatedUser?.fullName ?? id}`
          : `Updated account details for ${updatedUser?.fullName ?? id}`;

    void recordAuditLog({
      actorId: req.session.userId ?? null,
      action: actionLabel,
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
