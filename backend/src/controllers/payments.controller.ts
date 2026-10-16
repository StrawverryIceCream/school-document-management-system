// controllers/payments.controller.ts
import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  documentRequests,
  documentTypes,
  notifications,
  payments,
  users,
} from "../db/schema.js";
import { uploadPaymentProof } from "../services/storage.service.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const RECEIPT_PREFIX = "RCP";
const RECEIPT_RANDOM_BYTES = 4;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAYMENT_METHODS = ["card", "e_wallet", "bank_transfer", "cash"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Never expose passwordHash through the payer relation
const PAYER_COLUMNS = {
  id: true,
  studentId: true,
  fullName: true,
  email: true,
} as const;

type Payment = typeof payments.$inferSelect;

type CreatePaymentResult =
  | { ok: true; payment: Payment }
  | { ok: false; status: number; error: string };

interface GetPaymentsQuery {
  search?: string;
  method?: string;
  requestId?: string;
  page?: string;
  limit?: string;
}

interface GetMyPaymentsQuery {
  page?: string;
  limit?: string;
}

interface CreatePaymentBody {
  requestId?: unknown;
  method?: unknown;
}

function getSessionUserId(req: Request): string | undefined {
  return req.session.userId;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

// Drizzle may wrap the driver error, so check the cause chain too
function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const { code, cause } = err as { code?: unknown; cause?: unknown };
  if (code === "23505") return true;
  return isUniqueViolation(cause);
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

// Generated server-side so a client can never choose its own receipt number
function buildReceiptNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(RECEIPT_RANDOM_BYTES)
    .toString("hex")
    .toUpperCase();
  return `${RECEIPT_PREFIX}-${date}-${suffix}`;
}

function requestIdsOwnedBy(userId: string) {
  return db
    .select({ id: documentRequests.id })
    .from(documentRequests)
    .where(eq(documentRequests.userId, userId));
}

// ---------- Requester ----------

export async function createPayment(req: Request, res: Response) {
  try {
    const userId = getSessionUserId(req as Request);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { requestId, method } = (req.body ?? {}) as CreatePaymentBody;

    if (!isUuid(requestId)) {
      return res.status(400).json({ error: "A valid requestId is required" });
    }

    if (!isPaymentMethod(method)) {
      return res.status(400).json({
        error: `Method must be one of: ${PAYMENT_METHODS.join(", ")}`,
      });
    }

    // Amount comes from the document type's fee, never from the request body
    const result = await db.transaction(
      async (tx): Promise<CreatePaymentResult> => {
        // Row lock stops two simultaneous payments for the same request
        const [request] = await tx
          .select()
          .from(documentRequests)
          .where(
            and(
              eq(documentRequests.id, requestId),
              eq(documentRequests.userId, userId),
            ),
          )
          .for("update");

        if (!request) {
          return { ok: false, status: 404, error: "Request not found" };
        }

        if (request.status !== "pending") {
          return {
            ok: false,
            status: 409,
            error: "Only pending requests can be paid",
          };
        }

        const existing = await tx.query.payments.findFirst({
          where: eq(payments.requestId, requestId),
          columns: { id: true },
        });

        if (existing) {
          return {
            ok: false,
            status: 409,
            error: "This request has already been paid",
          };
        }

        const documentType = await tx.query.documentTypes.findFirst({
          where: eq(documentTypes.id, request.documentTypeId),
          columns: { name: true, fee: true },
        });

        if (!documentType) {
          return { ok: false, status: 404, error: "Document type not found" };
        }

        if (!(Number(documentType.fee) > 0)) {
          return {
            ok: false,
            status: 400,
            error: "No payment is required for this document",
          };
        }

        const [payment] = await tx
          .insert(payments)
          .values({
            requestId,
            amount: String(documentType.fee),
            method,
            receiptNumber: buildReceiptNumber(),
          })
          .returning();

        if (!payment) {
          return {
            ok: false,
            status: 500,
            error: "Failed to record payment",
          };
        }

        // Digital receipt for the student; no senderId means system-sent
        await tx.insert(notifications).values({
          userId,
          requestId,
          title: "Payment received",
          message: `We received your payment of ${payment.amount} for ${documentType.name}. Receipt number: ${payment.receiptNumber}.`,
        });

        return { ok: true, payment };
      },
    );

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(201).json(result.payment);
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res
        .status(409)
        .json({ error: "Could not generate a receipt, please try again" });
    }

    console.error("[createPayment] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMyPayments(
  req: Request<unknown, unknown, unknown, GetMyPaymentsQuery>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req as Request);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { page, limit } = req.query;
    const { pageNum, limitNum, offset } = parsePagination(page, limit);

    const whereClause = inArray(payments.requestId, requestIdsOwnedBy(userId));

    const [data, totalResult] = await Promise.all([
      db.query.payments.findMany({
        where: whereClause,
        with: { request: { with: { documentType: true } } },
        orderBy: [desc(payments.createdAt)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(payments).where(whereClause),
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
    console.error("[getMyPayments] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMyPaymentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Scoping to the user's own requests so nobody can read another user's receipt
    const payment = await db.query.payments.findFirst({
      where: and(
        eq(payments.id, id),
        inArray(payments.requestId, requestIdsOwnedBy(userId)),
      ),
      with: { request: { with: { documentType: true } } },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.json(payment);
  } catch (err) {
    console.error("[getMyPaymentById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ---------- Staff / admin ----------

export async function getAllPayments(
  req: Request<unknown, unknown, unknown, GetPaymentsQuery>,
  res: Response,
) {
  try {
    const { search, method, requestId, page, limit } = req.query;
    const { pageNum, limitNum, offset } = parsePagination(page, limit);

    if (requestId !== undefined && !isUuid(requestId)) {
      return res.status(400).json({ error: "requestId must be a valid id" });
    }

    const conditions = [];

    if (typeof search === "string" && search.trim()) {
      const pattern = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(payments.receiptNumber, pattern),
          inArray(
            payments.requestId,
            db
              .select({ id: documentRequests.id })
              .from(documentRequests)
              .innerJoin(users, eq(documentRequests.userId, users.id))
              .where(
                or(
                  ilike(users.fullName, pattern),
                  ilike(users.studentId, pattern),
                ),
              ),
          ),
        ),
      );
    }

    if (isPaymentMethod(method)) {
      conditions.push(eq(payments.method, method));
    }

    if (requestId) {
      conditions.push(eq(payments.requestId, requestId));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
      db.query.payments.findMany({
        where: whereClause,
        with: {
          request: {
            with: {
              user: { columns: PAYER_COLUMNS },
              documentType: true,
            },
          },
        },
        orderBy: [desc(payments.createdAt)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(payments).where(whereClause),
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
    console.error("[getAllPayments] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPaymentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, id),
      with: {
        request: {
          with: {
            user: { columns: PAYER_COLUMNS },
            documentType: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.json(payment);
  } catch (err) {
    console.error("[getPaymentById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function uploadPaymentProofHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id: paymentId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Payment proof image is required" });
    }

    // Join through the request so students can only upload to their own payments
    const [payment] = await db
      .select({ id: payments.id, status: payments.status })
      .from(payments)
      .innerJoin(documentRequests, eq(payments.requestId, documentRequests.id))
      .where(
        and(eq(payments.id, paymentId), eq(documentRequests.userId, userId)),
      );

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // A verified payment is final; replacing its proof would invalidate the receipt
    if (payment.status === "verified") {
      return res
        .status(409)
        .json({ error: "Cannot replace proof of a verified payment" });
    }

    const url = await uploadPaymentProof(req.file.buffer, paymentId);
    await db
      .update(payments)
      .set({ paymentProofUrl: url })
      .where(eq(payments.id, paymentId));

    return res.json({ paymentProofUrl: url });
  } catch (err) {
    console.error("[uploadPaymentProof] error:", err);
    return res.status(500).json({ error: "Failed to upload payment proof" });
  }
}
