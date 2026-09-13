import type { Request, Response } from "express";
import { db } from "../db/db.js";
import { documentTypes } from "../db/schema.js";
import { and, count, eq, ilike, or } from "drizzle-orm";

export async function getAllDocument(req: Request, res: Response) {
  try {
    const { search, isActive, page = "1", limit = "20" } = req.query;

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
          ilike(documentTypes.name, `%${search}%`),
          ilike(documentTypes.code, `%${search}%`),
        ),
      );
    }

    if (isActive !== undefined) {
      conditions.push(eq(documentTypes.isActive, isActive === "true"));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allDocuments, totalResult] = await Promise.all([
      db.query.documentTypes.findMany({
        where: whereClause,
        orderBy: (documentTypes, { desc }) => [desc(documentTypes.createdAt)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(documentTypes).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allDocuments,
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

export async function getDocumentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const document = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.id, id),
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
    const { code, name, description, requiredFields, fee, isActive } = req.body;

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
    };

    const [document] = await db
      .insert(documentTypes)
      .values(documentData)
      .returning();

    if (!document) {
      return res.status(500).json({ error: "Failed to create document" });
    }

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
    const { id } = req.params;
    const { code, name, description, fee, isActive, requiredFields } = req.body;

    const updates: Partial<typeof documentTypes.$inferInsert> = {};

    if (code !== undefined) updates.code = code;
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (fee !== undefined) updates.fee = fee;
    if (isActive !== undefined) updates.isActive = isActive;
    if (requiredFields !== undefined) updates.requiredFields = requiredFields;

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

    return res.json(updated);
  } catch (err: any) {
    if (err?.code === "23505") {
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

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("[deleteDocumentById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
