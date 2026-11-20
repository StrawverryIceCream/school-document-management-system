import type { Request, Response } from "express";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  accountUpdateRequests,
  courses,
  users,
} from "../db/schema.js";
import { getActiveAcademicTerm } from "./settings.controller.js";
import { uploadCorProof } from "../services/storage.service.js";
import { recordAuditLog } from "../services/audit.service.js";
import {
  createAndDispatchNotification,
  notifyAdmins,
} from "../services/notification.service.js";
import {
  buildApprovedStandingPatch,
  canUserReviewAccountUpdates,
  extractCourseCodeFromSection,
  validateRequestedStanding,
} from "../lib/term-standing.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(val: unknown): val is string {
  return typeof val === "string" && UUID_REGEX.test(val);
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

async function resolveCourseForStudent(
  courseRef?: unknown,
  section?: string | null,
  preferredCollegeId?: string | null,
) {
  if (typeof courseRef === "string" && courseRef.trim()) {
    const trimmed = courseRef.trim();
    return db.query.courses.findFirst({
      where: isUuid(trimmed)
        ? eq(courses.id, trimmed)
        : and(
            eq(courses.isActive, true),
            ilike(courses.code, escapeLikePattern(trimmed)),
          ),
      columns: { id: true, code: true, collegeId: true },
    });
  }

  const inferredCode = extractCourseCodeFromSection(section);
  if (!inferredCode) return null;

  const escaped = escapeLikePattern(inferredCode);
  if (preferredCollegeId) {
    const collegeMatch = await db.query.courses.findFirst({
      where: and(
        eq(courses.isActive, true),
        eq(courses.collegeId, preferredCollegeId),
        ilike(courses.code, escaped),
      ),
      columns: { id: true, code: true, collegeId: true },
    });
    if (collegeMatch) return collegeMatch;
  }

  return db.query.courses.findFirst({
    where: and(eq(courses.isActive, true), ilike(courses.code, escaped)),
    columns: { id: true, code: true, collegeId: true },
  });
}

function parsePagination(page?: unknown, limit?: unknown) {
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const offset = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, offset };
}

export async function canReviewAccountUpdates(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });
  return canUserReviewAccountUpdates(user);
}

export async function createAccountUpdate(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "student") {
      return res.status(403).json({
        error: "Only students can submit academic term verification requests.",
      });
    }

    const { requestedStudentStatus, requestedSection, courseId } = req.body;
    const rawYear = req.body.requestedYearLevel;
    const requestedYearLevel =
      rawYear !== undefined && rawYear !== null && rawYear !== ""
        ? parseInt(String(rawYear), 10)
        : null;

    const validation = validateRequestedStanding({
      requestedStudentStatus,
      requestedYearLevel,
      requestedSection,
    });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Certificate of Registration (COR) or alumni proof file is required.",
      });
    }

    // Check for existing pending request BEFORE resolving or uploading files
    const existingPending = await db.query.accountUpdateRequests.findFirst({
      where: and(
        eq(accountUpdateRequests.userId, user.id),
        eq(accountUpdateRequests.status, "pending"),
      ),
    });
    if (existingPending) {
      return res.status(400).json({
        error:
          "You already have a pending verification request. Please wait for administrator review.",
      });
    }

    const activeAcademicTerm = await getActiveAcademicTerm();
    const isAlumni = requestedStudentStatus === "alumni";
    const trimmedSection =
      !isAlumni && typeof requestedSection === "string"
        ? requestedSection.trim() || null
        : null;

    const hasExplicitCourse =
      typeof courseId === "string" && courseId.trim().length > 0;
    const canModifyCourse =
      !user.courseId ||
      (hasExplicitCourse && user.verifiedAcademicTerm !== activeAcademicTerm);

    const resolvedCourse = canModifyCourse
      ? await resolveCourseForStudent(
          hasExplicitCourse ? courseId : null,
          trimmedSection,
          user.collegeId,
        )
      : null;

    if (hasExplicitCourse && canModifyCourse && !resolvedCourse) {
      return res.status(400).json({
        error: "Selected degree program could not be found.",
      });
    }

    if (!user.courseId && !resolvedCourse && trimmedSection) {
      return res.status(400).json({
        error:
          "Degree program (course) is required when a section is specified. Please select your college and degree program.",
      });
    }

    const proofFileUrl = await uploadCorProof(req.file.buffer, user.id);

    const [created] = await db
      .insert(accountUpdateRequests)
      .values({
        userId: user.id,
        academicTerm: activeAcademicTerm,
        previousYearLevel: user.yearLevel ?? null,
        previousSection: user.section ?? null,
        previousStudentStatus: (user.studentStatus as any) ?? null,
        requestedYearLevel: isAlumni ? null : requestedYearLevel,
        requestedSection: isAlumni
          ? null
          : typeof requestedSection === "string"
            ? requestedSection.trim() || null
            : null,
        requestedStudentStatus: requestedStudentStatus as any,
        proofFileUrl,
        proofFileName: req.file.originalname,
        status: "pending",
      })
      .returning();

    if (!created) {
      return res.status(500).json({ error: "Failed to submit verification request" });
    }

    if (resolvedCourse && canModifyCourse) {
      await db
        .update(users)
        .set({
          courseId: resolvedCourse.id,
          collegeId: resolvedCourse.collegeId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    void notifyAdmins({
      senderId: user.id,
      title: "New Academic Term Verification",
      message: `${user.fullName} submitted an academic term verification request for ${activeAcademicTerm}.`,
      type: "system",
    }).catch((err) => {
      console.error("[createAccountUpdate] notifyAdmins error:", err);
    });

    void recordAuditLog({
      actorId: user.id,
      action: "account_update.created",
      entityType: "account",
      entityId: created.id,
      metadata: {
        academicTerm: activeAcademicTerm,
        requestedStudentStatus,
        requestedYearLevel: isAlumni ? null : requestedYearLevel,
        requestedSection: isAlumni ? null : requestedSection,
      },
    });

    return res.status(201).json({ updateRequest: created });
  } catch (err) {
    console.error("[createAccountUpdate] error:", err);
    return res.status(500).json({ error: "Failed to submit verification request" });
  }
}

export async function getMyLatestUpdate(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const latest = await db.query.accountUpdateRequests.findFirst({
      where: eq(accountUpdateRequests.userId, userId),
      orderBy: [desc(accountUpdateRequests.createdAt)],
    });

    return res.json({ updateRequest: latest ?? null });
  } catch (err) {
    console.error("[getMyLatestUpdate] error:", err);
    return res.status(500).json({ error: "Failed to fetch verification status" });
  }
}

export async function listAccountUpdates(req: Request, res: Response) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const permitted = await canReviewAccountUpdates(userId);
    if (!permitted) {
      return res.status(403).json({
        error: "You do not have permission to view verification requests.",
      });
    }

    const { status, search, page, limit } = req.query;
    const { pageNum, limitNum, offset } = parsePagination(page, limit);

    const conditions = [];

    if (
      status === "pending" ||
      status === "approved" ||
      status === "rejected"
    ) {
      conditions.push(eq(accountUpdateRequests.status, status));
    }

    if (typeof search === "string" && search.trim()) {
      const pattern = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(accountUpdateRequests.requestedSection, pattern),
          inArray(
            accountUpdateRequests.userId,
            db
              .select({ id: users.id })
              .from(users)
              .where(
                or(
                  ilike(users.fullName, pattern),
                  ilike(users.email, pattern),
                  ilike(users.studentId, pattern),
                ),
              ),
          ),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
      db.query.accountUpdateRequests.findMany({
        where: whereClause,
        with: {
          user: {
            columns: { passwordHash: false },
            with: {
              college: true,
              course: true,
            },
          },
          reviewer: {
            columns: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: [desc(accountUpdateRequests.createdAt)],
        limit: limitNum,
        offset,
      }),
      db
        .select({ total: count() })
        .from(accountUpdateRequests)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.json({
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (err) {
    console.error("[listAccountUpdates] error:", err);
    return res.status(500).json({ error: "Failed to list verification requests" });
  }
}

export async function reviewAccountUpdate(req: Request, res: Response) {
  try {
    const reviewerId = req.session.userId;
    if (!reviewerId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const permitted = await canReviewAccountUpdates(reviewerId);
    if (!permitted) {
      return res.status(403).json({
        error: "You do not have permission to review verification requests.",
      });
    }

    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const { decision, rejectionReason } = req.body ?? {};
    if (decision !== "approved" && decision !== "rejected") {
      return res.status(400).json({
        error: "Decision must be either 'approved' or 'rejected'.",
      });
    }

    if (decision === "rejected" && (!rejectionReason || !String(rejectionReason).trim())) {
      return res.status(400).json({
        error: "Rejection reason is required when rejecting a request.",
      });
    }

    const targetRequest = await db.query.accountUpdateRequests.findFirst({
      where: eq(accountUpdateRequests.id, id),
    });

    if (!targetRequest) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    if (targetRequest.status !== "pending") {
      return res.status(400).json({
        error: "This verification request has already been reviewed.",
      });
    }

    let approvedPatch: ReturnType<typeof buildApprovedStandingPatch> | null = null;
    let backfilledPlacement: { courseId: string; collegeId: string } | null = null;

    if (decision === "approved") {
      const targetStudent = await db.query.users.findFirst({
        where: eq(users.id, targetRequest.userId),
        columns: { id: true, role: true, courseId: true, collegeId: true },
      });
      if (!targetStudent) {
        return res.status(404).json({ error: "Student account not found" });
      }
      if (targetStudent.role !== "student") {
        return res.status(400).json({
          error:
            "Account is no longer a student and cannot receive student standing updates.",
        });
      }

      approvedPatch = buildApprovedStandingPatch({
        academicTerm: targetRequest.academicTerm,
        requestedStudentStatus: targetRequest.requestedStudentStatus,
        requestedYearLevel: targetRequest.requestedYearLevel,
        requestedSection: targetRequest.requestedSection,
      });

      if (!targetStudent.courseId) {
        const matchedCourse = await resolveCourseForStudent(
          null,
          approvedPatch.section,
          targetStudent.collegeId,
        );
        if (matchedCourse) {
          backfilledPlacement = {
            courseId: matchedCourse.id,
            collegeId: matchedCourse.collegeId,
          };
        } else if (approvedPatch.section) {
          return res.status(400).json({
            error:
              "Student account has no assigned degree program (course). Please assign their course in Edit User Details before approving.",
          });
        }
      }
    }

    let updatedRecord;

    await db.transaction(async (tx) => {
      if (decision === "approved" && approvedPatch) {
        await tx
          .update(users)
          .set({
            studentStatus: approvedPatch.studentStatus as any,
            yearLevel: approvedPatch.yearLevel,
            section: approvedPatch.section,
            verifiedAcademicTerm: approvedPatch.verifiedAcademicTerm,
            ...(backfilledPlacement ?? {}),
            updatedAt: new Date(),
          })
          .where(eq(users.id, targetRequest.userId));

        const [res] = await tx
          .update(accountUpdateRequests)
          .set({
            status: "approved",
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(accountUpdateRequests.id, targetRequest.id))
          .returning();

        updatedRecord = res;
      } else {
        const [res] = await tx
          .update(accountUpdateRequests)
          .set({
            status: "rejected",
            rejectionReason: String(rejectionReason).trim(),
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(accountUpdateRequests.id, targetRequest.id))
          .returning();

        updatedRecord = res;
      }
    });

    void recordAuditLog({
      actorId: reviewerId,
      action: `account_update.${decision}`,
      entityType: "account",
      entityId: targetRequest.id,
      metadata: {
        userId: targetRequest.userId,
        academicTerm: targetRequest.academicTerm,
        decision,
        rejectionReason:
          decision === "rejected" ? String(rejectionReason).trim() : undefined,
      },
    });

    void createAndDispatchNotification({
      userId: targetRequest.userId,
      senderId: reviewerId,
      title:
        decision === "approved"
          ? "Academic Standing Verified"
          : "Academic Standing Verification Rejected",
      message:
        decision === "approved"
          ? `Your academic standing for ${targetRequest.academicTerm} has been verified and updated.`
          : `Your verification request for ${targetRequest.academicTerm} was rejected: ${String(rejectionReason).trim()}`,
      type: "system",
    });

    return res.json({ updateRequest: updatedRecord });
  } catch (err) {
    console.error("[reviewAccountUpdate] error:", err);
    return res.status(500).json({ error: "Failed to review verification request" });
  }
}
