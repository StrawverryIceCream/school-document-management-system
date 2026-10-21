import type { Request, Response } from "express";
import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  colleges,
  documentRequests,
  documentTypes,
  notifications,
  offices,
  officeSectorEnum,
  requestRoutingSteps,
  requestStatusEnum,
  requestStatusHistory,
  users,
} from "../db/schema.js";
import { recordAuditLog } from "../services/audit.service.js";
import { sendStatusNotificationEmail } from "../services/email.service.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const PURPOSE_MAX_LENGTH = 500;
const STAFF_NOTES_MAX_LENGTH = 1000;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const STATUSES = requestStatusEnum.enumValues;
type RequestStatus = (typeof STATUSES)[number];

// Requests only move forward, or get cancelled before they are claimed
const STATUS_TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  pending: ["processing", "cancelled"],
  awaiting_payment: ["processing", "cancelled"],
  processing: ["ready", "cancelled"],
  on_hold: ["processing", "cancelled"],
  ready: ["claimed", "cancelled"],
  claimed: [],
  rejected: [],
  cancelled: [],
};

// Staff need student details to process a request; never expose passwordHash
const REQUESTER_COLUMNS = {
  id: true,
  studentId: true,
  fullName: true,
  email: true,
  role: true,
  collegeId: true,
  department: true,
  section: true,
} as const;

interface RequiredField {
  label: string;
  type: string;
  required: boolean;
}

interface GetRequestsQuery {
  search?: string;
  status?: string;
  userId?: string;
  college?: string;
  collegeId?: string;
  officeId?: string;
  officeCode?: string;
  sector?: string;
  page?: string;
  limit?: string;
}

interface CreateRequestBody {
  documentTypeId?: unknown;
  purpose?: unknown;
  formData?: unknown;
}

interface UpdateStatusBody {
  status?: unknown;
  releaseDate?: unknown;
  staffNotes?: unknown;
  releasePdfUrl?: unknown;
}

function getSessionUserId(req: Pick<Request, "session">): string | undefined {
  return req.session.userId;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function isRequestStatus(value: unknown): value is RequestStatus {
  return (
    typeof value === "string" && (STATUSES as readonly string[]).includes(value)
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Rejects impossible dates like 2026-02-31 that pass the regex
function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_REGEX.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  );
}

function parsePagination(page?: string, limit?: string) {
  const pageNum = Math.max(
    DEFAULT_PAGE,
    parseInt(page ?? "", 10) || DEFAULT_PAGE,
  );
  const limitNum = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(limit ?? "", 10) || DEFAULT_LIMIT),
  );
  return { pageNum, limitNum, offset: (pageNum - 1) * limitNum };
}

// Form data is keyed by each required field's label
function validateFormData(
  fields: RequiredField[],
  formData: Record<string, unknown>,
): string | null {
  const allowedLabels = new Set(fields.map((field) => field.label));

  for (const key of Object.keys(formData)) {
    if (!allowedLabels.has(key)) return `Unknown field: ${key}`;
  }

  for (const field of fields) {
    const value = formData[field.label];
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    if (field.required && isEmpty) return `${field.label} is required`;

    if (
      !isEmpty &&
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    ) {
      return `${field.label} has an invalid value`;
    }
  }

  return null;
}

function buildStatusNotification(
  status: RequestStatus,
  documentName: string,
  releaseDate: string | null,
): { title: string; message: string } | null {
  switch (status) {
    case "processing":
      return {
        title: "Request being processed",
        message: `Your request for ${documentName} is now being processed.`,
      };
    case "ready":
      return {
        title: "Request ready",
        message: `Your ${documentName} is ready${
          releaseDate ? ` for release on ${releaseDate}` : ""
        }.`,
      };
    case "claimed":
      return {
        title: "Request claimed",
        message: `Your ${documentName} has been marked as claimed.`,
      };
    case "cancelled":
      return {
        title: "Request cancelled",
        message: `Your request for ${documentName} was cancelled.`,
      };
    default:
      return null;
  }
}

// ---------- Staff / admin ----------

export async function getAllRequests(
  req: Request<unknown, unknown, unknown, GetRequestsQuery>,
  res: Response,
) {
  try {
    const {
      search,
      status,
      userId,
      college,
      collegeId,
      officeId,
      officeCode,
      sector,
      page,
      limit,
    } = req.query;
    const { pageNum, limitNum, offset } = parsePagination(page, limit);

    if (userId !== undefined && !isUuid(userId)) {
      return res.status(400).json({ error: "userId must be a valid id" });
    }

    const conditions = [];

    if (officeId && isUuid(officeId)) {
      conditions.push(
        or(
          // 1. Direct document type assignment
          inArray(
            documentRequests.documentTypeId,
            db
              .select({ id: documentTypes.id })
              .from(documentTypes)
              .where(eq(documentTypes.officeId, officeId)),
          ),
          // 2. Active routing step assigned to this office
          inArray(
            documentRequests.id,
            db
              .select({ requestId: requestRoutingSteps.requestId })
              .from(requestRoutingSteps)
              .where(
                and(
                  eq(requestRoutingSteps.officeId, officeId),
                  eq(requestRoutingSteps.status, "pending"),
                ),
              ),
          ),
        ),
      );
    } else if (typeof officeCode === "string" && officeCode.trim()) {
      const code = officeCode.trim().toUpperCase();
      conditions.push(
        or(
          ilike(documentRequests.documentTypeCode, `${code}-%`),
          // Academic colleges
          inArray(
            documentRequests.userId,
            db
              .select({ id: users.id })
              .from(users)
              .innerJoin(colleges, eq(users.collegeId, colleges.id))
              .where(ilike(colleges.code, code)),
          ),
          // Faculty/staff department match
          inArray(
            documentRequests.userId,
            db
              .select({ id: users.id })
              .from(users)
              .where(ilike(users.department, `%${code}%`)),
          ),
        ),
      );
    }

    if (typeof sector === "string" && sector.trim()) {
      const normSector = sector.trim().toUpperCase();
      if (
        (officeSectorEnum.enumValues as readonly string[]).includes(normSector)
      ) {
        conditions.push(
          inArray(
            documentRequests.documentTypeId,
            db
              .select({ id: documentTypes.id })
              .from(documentTypes)
              .innerJoin(offices, eq(documentTypes.officeId, offices.id))
              .where(
                eq(
                  offices.sector,
                  normSector as (typeof officeSectorEnum.enumValues)[number],
                ),
              ),
          ),
        );
      }
    }

    const targetCollege = collegeId ?? college;
    if (typeof targetCollege === "string" && targetCollege.trim()) {
      const trimmed = targetCollege.trim();
      const collegeMatch = isUuid(trimmed)
        ? eq(colleges.id, trimmed)
        : or(
            ilike(colleges.code, trimmed),
            ilike(colleges.name, `%${trimmed}%`),
          );

      conditions.push(
        inArray(
          documentRequests.userId,
          db
            .select({ id: users.id })
            .from(users)
            .innerJoin(colleges, eq(users.collegeId, colleges.id))
            .where(collegeMatch),
        ),
      );
    }

    if (typeof search === "string" && search.trim()) {
      const pattern = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(documentRequests.referenceNumber, pattern),
          ilike(documentRequests.purpose, pattern),
          ilike(documentRequests.internalNotes, pattern),
          inArray(
            documentRequests.userId,
            db
              .select({ id: users.id })
              .from(users)
              .where(
                or(
                  ilike(users.fullName, pattern),
                  ilike(users.studentId, pattern),
                  ilike(users.email, pattern),
                  ilike(users.role, pattern),
                ),
              ),
          ),
          inArray(
            documentRequests.documentTypeId,
            db
              .select({ id: documentTypes.id })
              .from(documentTypes)
              .where(
                or(
                  ilike(documentTypes.name, pattern),
                  ilike(documentTypes.code, pattern),
                  ilike(documentTypes.description, pattern),
                ),
              ),
          ),
        ),
      );
    }

    if (isRequestStatus(status)) {
      conditions.push(eq(documentRequests.status, status));
    }

    if (userId) {
      conditions.push(eq(documentRequests.userId, userId));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
      db.query.documentRequests.findMany({
        where: whereClause,
        with: {
          user: {
            columns: REQUESTER_COLUMNS,
            with: {
              college: { columns: { id: true, code: true, name: true } },
            },
          },
          documentType: {
            with: {
              officeRecord: {
                columns: {
                  id: true,
                  code: true,
                  name: true,
                  sector: true,
                },
              },
            },
          },
        },
        orderBy: [desc(documentRequests.createdAt)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(documentRequests).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    return res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllRequests] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getRequestById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const request = await db.query.documentRequests.findFirst({
      where: eq(documentRequests.id, id),
      with: {
        user: {
          columns: REQUESTER_COLUMNS,
          with: {
            college: { columns: { id: true, code: true, name: true } },
          },
        },
        documentType: true,
        payments: true,
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    return res.json({
      ...request,
      availableTransitions: STATUS_TRANSITIONS[request.status],
    });
  } catch (err) {
    console.error("[getRequestById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateRequestStatus(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const staffId = getSessionUserId(req);
    if (!staffId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { status, releaseDate, staffNotes, releasePdfUrl } = (req.body ??
      {}) as UpdateStatusBody;

    if (!isRequestStatus(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${STATUSES.join(", ")}` });
    }

    if (
      releaseDate !== undefined &&
      releaseDate !== null &&
      !isValidDateString(releaseDate)
    ) {
      return res
        .status(400)
        .json({ error: "releaseDate must be a valid YYYY-MM-DD date" });
    }

    if (staffNotes !== undefined && staffNotes !== null) {
      if (
        typeof staffNotes !== "string" ||
        staffNotes.trim().length > STAFF_NOTES_MAX_LENGTH
      ) {
        return res.status(400).json({
          error: `staffNotes must be at most ${STAFF_NOTES_MAX_LENGTH} characters`,
        });
      }
    }

    const request = await db.query.documentRequests.findFirst({
      where: eq(documentRequests.id, id),
      with: {
        documentType: { columns: { name: true, fee: true } },
        payments: { columns: { id: true } },
        user: { columns: { email: true, fullName: true } },
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (!STATUS_TRANSITIONS[request.status].includes(status)) {
      return res.status(409).json({
        error: `Cannot change status from ${request.status} to ${status}`,
      });
    }

    if (
      status === "processing" &&
      Number(request.documentType.fee) > 0 &&
      request.payments.length === 0
    ) {
      return res
        .status(409)
        .json({ error: "Payment is required before processing" });
    }

    const effectiveReleaseDate =
      (typeof releaseDate === "string" ? releaseDate : null) ??
      request.releaseDate;

    // The system promises students an official release date before pickup
    if (status === "ready" && !effectiveReleaseDate) {
      return res.status(400).json({
        error: "releaseDate is required when marking a request ready",
      });
    }

    const updates: Partial<typeof documentRequests.$inferInsert> = { status };

    if (typeof releaseDate === "string") updates.releaseDate = releaseDate;
    if (typeof releasePdfUrl === "string") {
      updates.releasePdfUrl = releasePdfUrl.trim() || null;
    }
    if (typeof staffNotes === "string") {
      updates.internalNotes = staffNotes.trim();
    }
    if (status === "claimed") updates.claimedAt = new Date();

    // Notification and status change succeed or fail together
    const updated = await db.transaction(async (tx) => {
      // Matching on the old status stops two staff members racing each other
      const [row] = await tx
        .update(documentRequests)
        .set(updates)
        .where(
          and(
            eq(documentRequests.id, id),
            eq(documentRequests.status, request.status),
          ),
        )
        .returning();

      if (!row) return null;

      const notification = buildStatusNotification(
        status,
        request.documentType.name,
        effectiveReleaseDate,
      );

      if (notification) {
        await tx.insert(notifications).values({
          userId: request.userId,
          senderId: staffId,
          requestId: id,
          ...notification,
        });
      }

      await tx.insert(requestStatusHistory).values({
        requestId: id,
        fromStatus: request.status,
        toStatus: status,
        changedBy: staffId,
        note: typeof staffNotes === "string" ? staffNotes.trim() : null,
      });

      return row;
    });

    if (!updated) {
      return res.status(409).json({
        error: "Request was updated by someone else, refresh and try again",
      });
    }

    void recordAuditLog({
      actorId: staffId,
      action: `Updated request status to ${status.replace("_", " ")}`,
      entityType: "request",
      entityId: id,
      ipAddress: req.ip,
      metadata: {
        fromStatus: request.status,
        toStatus: status,
        documentTypeName: request.documentType?.name,
      },
    });

    if (request.user?.email) {
      void sendStatusNotificationEmail(
        request.user.email,
        request.user.fullName,
        request.documentType.name,
        request.referenceNumber,
        status,
        {
          releaseDate: effectiveReleaseDate,
          remarks: typeof staffNotes === "string" ? staffNotes.trim() : null,
          releasePdfUrl:
            typeof releasePdfUrl === "string"
              ? releasePdfUrl.trim() || null
              : request.releasePdfUrl ?? null,
        },
      ).catch((err) => {
        console.error("[sendStatusNotificationEmail] error:", err);
      });
    }

    return res.json(updated);
  } catch (err) {
    console.error("[updateRequestStatus] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ---------- Requester (student) ----------

export async function getMyRequests(
  req: Request<unknown, unknown, unknown, GetRequestsQuery>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { status, page, limit } = req.query;
    const { pageNum, limitNum, offset } = parsePagination(page, limit);

    const conditions = [eq(documentRequests.userId, userId)];

    if (isRequestStatus(status)) {
      conditions.push(eq(documentRequests.status, status));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db.query.documentRequests.findMany({
        where: whereClause,
        with: { documentType: true },
        orderBy: [desc(documentRequests.createdAt)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(documentRequests).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    return res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getMyRequests] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMyRequestById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Filtering by userId too so nobody can read another user's request
    const request = await db.query.documentRequests.findFirst({
      where: and(
        eq(documentRequests.id, id),
        eq(documentRequests.userId, userId),
      ),
      with: { documentType: true, payments: true },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    return res.json(request);
  } catch (err) {
    console.error("[getMyRequestById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createRequest(req: Request, res: Response) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { documentTypeId, purpose, formData } = (req.body ??
      {}) as CreateRequestBody;

    if (!isUuid(documentTypeId)) {
      return res
        .status(400)
        .json({ error: "A valid documentTypeId is required" });
    }

    if (purpose !== undefined && purpose !== null) {
      if (
        typeof purpose !== "string" ||
        purpose.trim().length > PURPOSE_MAX_LENGTH
      ) {
        return res.status(400).json({
          error: `Purpose must be at most ${PURPOSE_MAX_LENGTH} characters`,
        });
      }
    }

    const submittedData = formData ?? {};
    if (!isPlainObject(submittedData)) {
      return res.status(400).json({ error: "formData must be an object" });
    }

    const documentType = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.id, documentTypeId),
    });

    if (!documentType) {
      return res.status(404).json({ error: "Document type not found" });
    }

    if (!documentType.isActive) {
      return res
        .status(400)
        .json({ error: "This document type is not available for requests" });
    }

    const fields = Array.isArray(documentType.requiredFields)
      ? (documentType.requiredFields as RequiredField[])
      : [];

    const formError = validateFormData(fields, submittedData);
    if (formError) {
      return res.status(400).json({ error: formError });
    }

    const trimmedPurpose = typeof purpose === "string" ? purpose.trim() : "";

    const [created] = await db
      .insert(documentRequests)
      .values({
        userId,
        documentTypeId,
        documentTypeCode: documentType.code,
        documentTypeName: documentType.name,
        amountDue: documentType.fee ?? "0",
        turnaroundDays: documentType.processingDays ?? 0,
        ...(trimmedPurpose ? { purpose: trimmedPurpose } : {}),
        formData: submittedData,
      })
      .returning();

    if (!created) {
      return res.status(500).json({ error: "Failed to create request" });
    }

    void recordAuditLog({
      actorId: userId,
      action: `Submitted request for ${documentType.name}`,
      entityType: "request",
      entityId: created.id,
      ipAddress: req.ip,
      metadata: {
        referenceNumber: created.referenceNumber,
        documentTypeCode: documentType.code,
        documentTypeName: documentType.name,
      },
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("[createRequest] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function cancelMyRequest(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const request = await db.query.documentRequests.findFirst({
      where: and(
        eq(documentRequests.id, id),
        eq(documentRequests.userId, userId),
      ),
      columns: { id: true, status: true },
      with: { payments: { columns: { id: true } } },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(409)
        .json({ error: "Only pending requests can be cancelled" });
    }
    if (request.payments.length > 0) {
      return res.status(409).json({
        error: "Paid requests can't be cancelled here, contact the registrar",
      });
    }
    // Re-checking pending in the WHERE closes the gap if staff picked it up meanwhile
    const [updated] = await db
      .update(documentRequests)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(documentRequests.id, id),
          eq(documentRequests.userId, userId),
          eq(documentRequests.status, "pending"),
        ),
      )
      .returning();

    if (!updated) {
      return res
        .status(409)
        .json({ error: "Request is already being processed" });
    }

    void recordAuditLog({
      actorId: userId,
      action: "Cancelled document request",
      entityType: "request",
      entityId: id,
      ipAddress: req.ip,
    });

    return res.json(updated);
  } catch (err) {
    console.error("[cancelMyRequest] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
