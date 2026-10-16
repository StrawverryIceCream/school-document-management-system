import type { Request, Response } from "express";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/db.js"; // Adjust import path
import { requestAttachments } from "../db/schema.js"; // Adjust import path

// GET /request-attachments
export async function getAllRequestAttachments(req: Request, res: Response) {
  try {
    const {
      search,
      requestId,
      uploadedBy,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (requestId) {
      conditions.push(eq(requestAttachments.requestId, requestId as string));
    }

    if (uploadedBy) {
      conditions.push(eq(requestAttachments.uploadedBy, uploadedBy as string));
    }

    if (search) {
      conditions.push(
        or(
          ilike(requestAttachments.fileName, `%${search}%`),
          ilike(requestAttachments.label, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allAttachments, totalResult] = await Promise.all([
      db.query.requestAttachments.findMany({
        where: whereClause,
        orderBy: (attachments, { desc }) => [desc(attachments.createdAt)],
        limit: limitNum,
        offset,
        with: {
          uploader: {
            columns: { passwordHash: false },
          },
          request: true,
        },
      }),
      db.select({ total: count() }).from(requestAttachments).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allAttachments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllRequestAttachments] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /request-attachments/:id
export async function getRequestAttachmentById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const attachment = await db.query.requestAttachments.findFirst({
      where: eq(requestAttachments.id, id),
      with: {
        uploader: {
          columns: { passwordHash: false },
        },
        request: true,
      },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    res.json(attachment);
  } catch (err) {
    console.error("[getRequestAttachmentById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /request-attachments
export async function createRequestAttachment(req: Request, res: Response) {
  try {
    const { requestId, uploadedBy, label, fileName, fileUrl, mimeType, sizeBytes } = req.body;

    if (!requestId || !uploadedBy || !fileName || !fileUrl) {
      return res.status(400).json({
        error: "requestId, uploadedBy, fileName, and fileUrl are required",
      });
    }

    const [newAttachment] = await db
      .insert(requestAttachments)
      .values({
        requestId,
        uploadedBy,
        label: label ? label.trim() : null,
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        mimeType: mimeType || null,
        sizeBytes: sizeBytes || null,
      })
      .returning();

    res.status(201).json(newAttachment);
  } catch (err) {
    console.error("[createRequestAttachment] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /request-attachments/:id
export async function updateRequestAttachmentById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const { label, fileName, fileUrl, mimeType, sizeBytes } = req.body;

    const attachment = await db.query.requestAttachments.findFirst({
      where: eq(requestAttachments.id, id),
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    const [updatedAttachment] = await db
      .update(requestAttachments)
      .set({
        ...(label !== undefined && { label: label ? label.trim() : null }),
        ...(fileName && { fileName: fileName.trim() }),
        ...(fileUrl && { fileUrl: fileUrl.trim() }),
        ...(mimeType !== undefined && { mimeType }),
        ...(sizeBytes !== undefined && { sizeBytes }),
      })
      .where(eq(requestAttachments.id, id))
      .returning();

    res.json(updatedAttachment);
  } catch (err) {
    console.error("[updateRequestAttachmentById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /request-attachments/:id
export async function deleteRequestAttachmentById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const attachment = await db.query.requestAttachments.findFirst({
      where: eq(requestAttachments.id, id),
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    await db.delete(requestAttachments).where(eq(requestAttachments.id, id));

    res.json({ message: "Attachment deleted successfully" });
  } catch (err) {
    console.error("[deleteRequestAttachmentById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}