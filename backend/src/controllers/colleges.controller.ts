import type { Request, Response } from "express";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/db.js"; // Adjust import path to your DB instance
import { colleges } from "../db/schema.js"; // Adjust import path to your schema file

// GET /colleges
export async function getAllColleges(req: Request, res: Response) {
  try {
    const { search, isActive, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(colleges.code, `%${search}%`),
          ilike(colleges.name, `%${search}%`)
        )
      );
    }

    if (isActive !== undefined) {
      conditions.push(eq(colleges.isActive, isActive === "true"));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allColleges, totalResult] = await Promise.all([
      db.query.colleges.findMany({
        where: whereClause,
        orderBy: (colleges, { asc }) => [asc(colleges.code)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(colleges).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allColleges,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllColleges] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /colleges/:id
export async function getCollegeById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const college = await db.query.colleges.findFirst({
      where: eq(colleges.id, id),
      with: {
        courses: true, // Optional: includes associated courses if defined in your relations
      },
    });

    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    res.json(college);
  } catch (err) {
    console.error("[getCollegeById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /colleges
export async function createCollege(req: Request, res: Response) {
  try {
    const { code, name, isActive } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: "Code and name are required" });
    }

    // Check if code already exists
    const existingCollege = await db.query.colleges.findFirst({
      where: eq(colleges.code, code.toUpperCase().trim()),
    });

    if (existingCollege) {
      return res.status(409).json({ error: "College code already exists" });
    }

    const [newCollege] = await db
      .insert(colleges)
      .values({
        code: code.toUpperCase().trim(),
        name: name.trim(),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    res.status(201).json(newCollege);
  } catch (err) {
    console.error("[createCollege] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /colleges/:id
export async function updateCollegeById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const { code, name, isActive } = req.body;

    const college = await db.query.colleges.findFirst({
      where: eq(colleges.id, id),
    });

    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    // If updating code, ensure it doesn't conflict with another college
    if (code && code.toUpperCase().trim() !== college.code) {
      const existingCollege = await db.query.colleges.findFirst({
        where: eq(colleges.code, code.toUpperCase().trim()),
      });

      if (existingCollege) {
        return res.status(409).json({ error: "College code already exists" });
      }
    }

    const [updatedCollege] = await db
      .update(colleges)
      .set({
        ...(code && { code: code.toUpperCase().trim() }),
        ...(name && { name: name.trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        updatedAt: new Date(),
      })
      .where(eq(colleges.id, id))
      .returning();

    res.json(updatedCollege);
  } catch (err) {
    console.error("[updateCollegeById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /colleges/:id
export async function deleteCollegeById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const college = await db.query.colleges.findFirst({
      where: eq(colleges.id, id),
    });

    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    await db.delete(colleges).where(eq(colleges.id, id));

    res.json({ message: "College deleted successfully" });
  } catch (err) {
    console.error("[deleteCollegeById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}