import { type Request, type Response } from "express";
import { db } from "../db/db.js";
import { users, offices, courses } from "../db/schema.js";
import { eq, and, ilike, or, count, inArray, sql } from "drizzle-orm";
import { recordAuditLog } from "../services/audit.service.js";
import {
  RoleTransitionValidationError,
  sanitizeRoleTransition,
  type RoleTransitionUpdateData,
} from "../lib/role-transition.js";
import { extractCourseCodeFromSection } from "../lib/term-standing.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

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

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : undefined;

    if (email !== undefined) {
      if (!normalizedEmail) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const emailExists = await db.query.users.findFirst({
        where: sql`lower(trim(${users.email})) = ${normalizedEmail}`,
      });

      if (emailExists && emailExists.id !== id) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const normalizedStudentId =
      typeof studentId === "string"
        ? studentId.trim().toUpperCase() || null
        : studentId;

    if (normalizedStudentId) {
      const studentIdExists = await db.query.users.findFirst({
        where: eq(users.studentId, normalizedStudentId),
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
    let resolvedOfficeId = officeId;
    let resolvedOffice = office;
    let resolvedCourseId =
      typeof courseId === "string" ? courseId.trim() || null : courseId;
    let resolvedCollegeId =
      typeof collegeId === "string" ? collegeId.trim() || null : collegeId;

    if (
      resolvedCollegeId &&
      !UUID_REGEX.test(resolvedCollegeId)
    ) {
      return res.status(400).json({ error: "Invalid college id" });
    }

    if (
      targetRole === "admin" &&
      typeof resolvedOfficeId === "string" &&
      resolvedOfficeId &&
      !UUID_REGEX.test(resolvedOfficeId)
    ) {
      return res.status(400).json({ error: "Invalid office id" });
    }

    if (targetRole === "staff") {
      const rawOfficeId =
        officeId !== undefined ? officeId : existingUser.officeId;
      const rawOffice = office !== undefined ? office : existingUser.office;

      if (!rawOfficeId && !rawOffice) {
        return res
          .status(400)
          .json({ error: "Staff role requires an assigned office" });
      }

      let foundOffice = null;
      if (rawOfficeId) {
        if (UUID_REGEX.test(rawOfficeId)) {
          foundOffice = await db.query.offices.findFirst({
            where: eq(offices.id, rawOfficeId),
          });
        } else {
          foundOffice = await db.query.offices.findFirst({
            where: or(
              ilike(offices.code, escapeLikePattern(rawOfficeId)),
              ilike(offices.name, `%${escapeLikePattern(rawOfficeId)}%`),
            ),
          });
        }
      }

      if (!foundOffice && rawOffice) {
        const legacyCode = rawOffice === "registrar" ? "OUR" : "HRMO";
        foundOffice = await db.query.offices.findFirst({
          where: eq(offices.code, legacyCode),
        });
      }

      if (!foundOffice) {
        return res.status(400).json({
          error: `Assigned office "${rawOfficeId || rawOffice}" could not be found.`,
        });
      }

      resolvedOfficeId = foundOffice.id;
      resolvedOffice =
        foundOffice.code === "OUR"
          ? "registrar"
          : foundOffice.code === "HRMO"
            ? "hr"
            : null;
    } else if (targetRole === "student") {
      const explicitCourseProvided =
        typeof resolvedCourseId === "string" && resolvedCourseId.length > 0;
      const rawCourseRef = explicitCourseProvided
        ? resolvedCourseId
        : resolvedCourseId === null
          ? null
          : existingUser.courseId ||
            extractCourseCodeFromSection(
              section !== undefined ? section : existingUser.section,
            );

      if (rawCourseRef) {
        const escapedCourseRef = escapeLikePattern(rawCourseRef);
        const preferredCollegeId = resolvedCollegeId ?? existingUser.collegeId;
        const foundCourse = UUID_REGEX.test(rawCourseRef)
          ? await db.query.courses.findFirst({
              where: eq(courses.id, rawCourseRef),
              columns: { id: true, collegeId: true },
            })
          : (preferredCollegeId
              ? await db.query.courses.findFirst({
                  where: and(
                    eq(courses.isActive, true),
                    eq(courses.collegeId, preferredCollegeId),
                    ilike(courses.code, escapedCourseRef),
                  ),
                  columns: { id: true, collegeId: true },
                })
              : null) ??
            (await db.query.courses.findFirst({
              where: and(
                eq(courses.isActive, true),
                ilike(courses.code, escapedCourseRef),
              ),
              columns: { id: true, collegeId: true },
            }));

        if (explicitCourseProvided && !foundCourse) {
          return res.status(400).json({
            error: `Assigned degree program "${rawCourseRef}" could not be found.`,
          });
        }

        if (foundCourse) {
          resolvedCourseId = foundCourse.id;
          resolvedCollegeId = foundCourse.collegeId;
        }
      }
    }

    let updateData: RoleTransitionUpdateData;
    try {
      updateData = sanitizeRoleTransition(existingUser, {
        ...(fullName !== undefined ? { fullName: fullName.trim() } : {}),
        ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(normalizedStudentId !== undefined
          ? { studentId: normalizedStudentId }
          : {}),
        ...(resolvedCollegeId !== undefined
          ? { collegeId: resolvedCollegeId }
          : {}),
        ...(resolvedCourseId !== undefined
          ? { courseId: resolvedCourseId }
          : {}),
        ...(section !== undefined ? { section } : {}),
        ...(yearLevel !== undefined
          ? {
              yearLevel:
                yearLevel === null ? null : Number(yearLevel),
            }
          : {}),
        ...(studentStatus !== undefined ? { studentStatus } : {}),
        ...(department !== undefined ? { department } : {}),
        ...(resolvedOffice !== undefined ? { office: resolvedOffice } : {}),
        ...(resolvedOfficeId !== undefined
          ? { officeId: resolvedOfficeId }
          : {}),
      });
    } catch (validationErr) {
      if (validationErr instanceof RoleTransitionValidationError) {
        return res.status(400).json({ error: validationErr.message });
      }
      throw validationErr;
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

    if (req.session.userId === id) {
      return res.status(400).json({
        error: "Cannot delete your own administrator account",
      });
    }

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
  } catch (err: any) {
    if (err?.code === "23503" || err?.cause?.code === "23503") {
      return res.status(409).json({
        error:
          "Cannot delete user with existing requests or records. Deactivate the account instead.",
      });
    }
    console.error("[deleteUserById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
