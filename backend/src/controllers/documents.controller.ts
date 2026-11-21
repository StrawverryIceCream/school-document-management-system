import type { Request, Response } from "express";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  documentTypes,
  offices,
  users,
  type RequiredField,
} from "../db/schema.js";
import {
  canStaffManageDocument,
  hasCrossOfficeReassignmentAttempt,
  isDocumentInStaffOffice,
  type OfficeActorRef,
} from "../lib/document-office-scope.js";
import {
  DOCUMENT_CATEGORIES,
  normalizeDocumentCreateOptions,
  type DocumentCategory,
} from "../lib/document-create-options.js";
import { recordAuditLog } from "../services/audit.service.js";

const CATEGORIES = DOCUMENT_CATEGORIES;

type DocumentRow = typeof documentTypes.$inferSelect;
type OfficeSummary = {
  id: string;
  code: string;
  name: string;
  sector: typeof offices.$inferSelect.sector;
};
type DocumentWithOffice = DocumentRow & { officeRecord: OfficeSummary | null };
type ResolvedDocumentActor = OfficeActorRef & { isActive: boolean };

function parsePagination(query: Request["query"]) {
  const { page = "1", limit = "20" } = query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(
    500,
    Math.max(1, parseInt(limit as string, 10) || 20),
  );
  const offset = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, offset };
}

function buildDocumentFilterWhere(query: Request["query"]) {
  const { search, isActive, category } = query;
  const conditions = [];

  if (typeof search === "string" && search.trim()) {
    const pattern = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(documentTypes.name, pattern),
        ilike(documentTypes.code, pattern),
      ),
    );
  }

  if (isActive !== undefined) {
    conditions.push(eq(documentTypes.isActive, isActive === "true"));
  }

  const rawCategory = typeof category === "string" ? category : undefined;
  if (rawCategory && CATEGORIES.includes(rawCategory as DocumentCategory)) {
    conditions.push(
      eq(documentTypes.category, rawCategory as DocumentCategory),
    );
  }

  return conditions.length ? and(...conditions) : undefined;
}

async function enrichDocumentOffices(
  docs: DocumentRow[],
): Promise<DocumentWithOffice[]> {
  const officeIds = Array.from(
    new Set(
      docs
        .map((doc) => doc.officeId)
        .filter((officeId): officeId is string => Boolean(officeId)),
    ),
  );

  if (officeIds.length === 0) {
    return docs.map((doc) => ({ ...doc, officeRecord: null }));
  }

  const officeRows = await db
    .select({
      id: offices.id,
      code: offices.code,
      name: offices.name,
      sector: offices.sector,
    })
    .from(offices)
    .where(inArray(offices.id, officeIds));

  const officeById = new Map(officeRows.map((row) => [row.id, row]));

  return docs.map((doc) => ({
    ...doc,
    officeRecord: doc.officeId ? (officeById.get(doc.officeId) ?? null) : null,
  }));
}

async function resolveDocumentActor(
  userId: string,
): Promise<ResolvedDocumentActor | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      role: true,
      office: true,
      officeId: true,
      isActive: true,
    },
    with: {
      officeRecord: {
        columns: { code: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    role: user.role,
    office: user.office,
    officeId: user.officeId,
    officeCode: user.officeRecord?.code ?? null,
    isActive: user.isActive,
  };
}

async function queryPaginatedDocuments(
  whereClause: ReturnType<typeof buildDocumentFilterWhere>,
  limitNum: number,
  offset: number,
) {
  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(documentTypes)
      .where(whereClause)
      .orderBy(desc(documentTypes.createdAt))
      .limit(limitNum)
      .offset(offset),
    db.select({ total: count() }).from(documentTypes).where(whereClause),
  ]);

  const data = await enrichDocumentOffices(rows);
  const total = totalResult?.[0]?.total ?? 0;

  return { data, total };
}

export async function getAllDocument(req: Request, res: Response) {
  try {
    const { pageNum, limitNum, offset } = parsePagination(req.query);
    const whereClause = buildDocumentFilterWhere(req.query);
    const { data, total } = await queryPaginatedDocuments(
      whereClause,
      limitNum,
      offset,
    );

    res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllDocument] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOfficeScopedDocuments(req: Request, res: Response) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const actor = await resolveDocumentActor(userId);
    if (!actor) {
      return res.status(401).json({ error: "Invalid session" });
    }
    if (!actor.isActive || (actor.role !== "admin" && actor.role !== "staff")) {
      return res
        .status(403)
        .json({ error: "You do not have permission to access this resource" });
    }

    const { pageNum, limitNum, offset } = parsePagination(req.query);
    const whereClause = buildDocumentFilterWhere(req.query);

    if (actor.role === "admin") {
      const { data, total } = await queryPaginatedDocuments(
        whereClause,
        limitNum,
        offset,
      );

      return res.json({
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    const rows = await db
      .select()
      .from(documentTypes)
      .where(whereClause)
      .orderBy(desc(documentTypes.createdAt));

    const enriched = await enrichDocumentOffices(rows);
    const scopedDocuments = enriched.filter((doc) =>
      isDocumentInStaffOffice(
        {
          code: doc.code,
          office: doc.office,
          officeId: doc.officeId,
          officeCode: doc.officeRecord?.code ?? null,
        },
        actor,
      ),
    );

    const total = scopedDocuments.length;
    const data = scopedDocuments.slice(offset, offset + limitNum);

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
    console.error("[getOfficeScopedDocuments] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDocumentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const document = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.id, id),
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
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.json(document);
  } catch (err) {
    console.error("[getDocumentById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createDocument(req: Request, res: Response) {
  try {
    const {
      code,
      name,
      description,
      requiredFields,
      fee,
      isActive,
      officeId,
    } = req.body;

    if (
      !code ||
      !name ||
      !Array.isArray(requiredFields) ||
      fee === undefined ||
      fee === null
    ) {
      return res.status(400).json({
        error: "Code, name, requiredFields, and fee are required",
      });
    }

    if (
      typeof officeId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        officeId,
      )
    ) {
      return res.status(400).json({ error: "Select a valid responsible office" });
    }

    const createOptions = normalizeDocumentCreateOptions(
      req.body as Record<string, unknown>,
    );
    if (!createOptions.success) {
      return res.status(400).json({ error: createOptions.error });
    }

    const [responsibleOffice] = await db
      .select({ id: offices.id })
      .from(offices)
      .where(and(eq(offices.id, officeId), eq(offices.isActive, true)))
      .limit(1);
    if (!responsibleOffice) {
      return res.status(400).json({ error: "Select an active responsible office" });
    }

    const existing = await db.query.documentTypes.findFirst({
      where: or(eq(documentTypes.code, code), eq(documentTypes.name, name)),
    });

    if (existing) {
      return res.status(409).json({ error: "Document already in use" });
    }

    const documentData = {
      code,
      name,
      ...(description?.trim() ? { description: description.trim() } : {}),
      requiredFields,
      fee,
      isActive: isActive ?? true,
      officeId,
      ...createOptions.options,
    };

    const [document] = await db
      .insert(documentTypes)
      .values(documentData)
      .returning();

    if (!document) {
      return res.status(500).json({ error: "Failed to create document" });
    }

    void recordAuditLog({
      actorId: req.session.userId ?? null,
      action: `Created document type "${document.name}"`,
      entityType: "document",
      entityId: document.id,
      ipAddress: req.ip,
      metadata: { code: document.code },
    });

    return res.status(201).json(document);
  } catch (err) {
    console.error("[createDocument] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateDocumentType(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const actor = await resolveDocumentActor(userId);
    if (!actor) {
      return res.status(401).json({ error: "Invalid session" });
    }
    if (!actor.isActive || (actor.role !== "admin" && actor.role !== "staff")) {
      return res
        .status(403)
        .json({ error: "You do not have permission to access this resource" });
    }

    const { id } = req.params;
    const existing = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "Document type not found" });
    }

    const [existingWithOffice] = await enrichDocumentOffices([existing]);
    const existingWithCode = {
      code: existing.code,
      office: existing.office,
      officeId: existing.officeId,
      officeCode: existingWithOffice?.officeRecord?.code ?? null,
    };

    if (!canStaffManageDocument(existingWithCode, actor)) {
      return res.status(403).json({
        error: "You can only update document types assigned to your office.",
      });
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    if (hasCrossOfficeReassignmentAttempt(existingWithCode, body, actor)) {
      return res.status(403).json({
        error: "Staff cannot reassign a document type to another office.",
      });
    }

    const {
      code,
      name,
      description,
      fee,
      isActive,
      requiredFields,
      processingDays,
      maxCopies,
      officeId,
      office,
      category,
    } = body;

    const updates: Partial<typeof documentTypes.$inferInsert> = {};

    if (code !== undefined) {
      if (typeof code !== "string" || !code.trim()) {
        return res
          .status(400)
          .json({ error: "Document code must be a non-empty string" });
      }
      updates.code = code.trim();
    }
    if (name !== undefined) updates.name = name as string;
    if (description !== undefined) {
      updates.description = description as string | null;
    }
    if (fee !== undefined) {
      updates.fee = typeof fee === "number" ? String(fee) : (fee as string);
    }
    if (isActive !== undefined) updates.isActive = isActive as boolean;
    if (requiredFields !== undefined) {
      updates.requiredFields = requiredFields as RequiredField[];
    }
    if (processingDays !== undefined) {
      updates.processingDays = Number(processingDays);
    }
    if (maxCopies !== undefined) updates.maxCopies = Number(maxCopies);
    if (category !== undefined) updates.category = category as DocumentCategory;

    // Defense-in-depth: never allow staff updates to alter office assignment.
    if (actor.role !== "staff") {
      if (officeId !== undefined) updates.officeId = officeId as string | null;
      if (office !== undefined) updates.office = office as "registrar" | "hr";
    } else {
      delete updates.officeId;
      delete updates.office;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const [updated] = await db
      .update(documentTypes)
      .set(updates)
      .where(eq(documentTypes.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Document type not found" });
    }

    void recordAuditLog({
      actorId: actor.id,
      action: `Updated document type "${updated.name}"`,
      entityType: "document",
      entityId: id,
      ipAddress: req.ip,
    });

    return res.json(updated);
  } catch (err: any) {
    if (err?.code === "23505" || err?.cause?.code === "23505") {
      return res
        .status(409)
        .json({ error: "A document type with that code already exists" });
    }

    console.error("[updateDocumentType] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteDocumentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const deletedDocument = await db
      .delete(documentTypes)
      .where(eq(documentTypes.id, id))
      .returning({
        id: documentTypes.id,
      });

    if (deletedDocument.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    void recordAuditLog({
      actorId: req.session.userId ?? null,
      action: `Deleted document type "${deletedDocument[0]?.id ?? id}"`,
      entityType: "document",
      entityId: id,
      ipAddress: req.ip,
    });

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("[deleteDocumentById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
