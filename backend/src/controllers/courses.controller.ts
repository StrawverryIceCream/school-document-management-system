import type { Request, Response } from "express";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/db.js"; // Adjust import path
import { courses, colleges } from "../db/schema.js"; // Adjust import path

// GET /courses
export async function getAllCourses(req: Request, res: Response) {
  try {
    const { search, collegeId, isActive, page = "1", limit = "20" } = req.query;

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
          ilike(courses.code, `%${search}%`),
          ilike(courses.name, `%${search}%`),
        ),
      );
    }

    if (collegeId) {
      conditions.push(eq(courses.collegeId, collegeId as string));
    }

    if (isActive !== undefined) {
      conditions.push(eq(courses.isActive, isActive === "true"));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allCourses, totalResult] = await Promise.all([
      db.query.courses.findMany({
        where: whereClause,
        orderBy: (courses, { asc }) => [asc(courses.code)],
        limit: limitNum,
        offset,
        with: {
          college: true, // Assuming you have a relation defined in your schema
        },
      }),
      db.select({ total: count() }).from(courses).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allCourses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllCourses] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /courses/:id
export async function getCourseById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        college: true,
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error("[getCourseById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /courses
export async function createCourse(req: Request, res: Response) {
  try {
    const { collegeId, code, name, isActive } = req.body;

    if (!collegeId || !code || !name) {
      return res
        .status(400)
        .json({ error: "College ID, code, and name are required" });
    }

    // Verify the college exists
    const collegeExists = await db.query.colleges.findFirst({
      where: eq(colleges.id, collegeId),
    });

    if (!collegeExists) {
      return res.status(404).json({ error: "Referenced college not found" });
    }

    // Check if the specific course code already exists within that college
    const existingCourse = await db.query.courses.findFirst({
      where: and(
        eq(courses.collegeId, collegeId),
        eq(courses.code, code.toUpperCase().trim()),
      ),
    });

    if (existingCourse) {
      return res
        .status(409)
        .json({ error: "Course code already exists in this college" });
    }

    const [newCourse] = await db
      .insert(courses)
      .values({
        collegeId,
        code: code.toUpperCase().trim(),
        name: name.trim(),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    res.status(201).json(newCourse);
  } catch (err) {
    console.error("[createCourse] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /courses/:id
export async function updateCourseById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;
    const { collegeId, code, name, isActive } = req.body;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // If changing the collegeId, ensure the new college exists
    if (collegeId && collegeId !== course.collegeId) {
      const collegeExists = await db.query.colleges.findFirst({
        where: eq(colleges.id, collegeId),
      });

      if (!collegeExists) {
        return res.status(404).json({ error: "Referenced college not found" });
      }
    }

    // Check unique constraint if changing collegeId or code
    const targetCollegeId = collegeId || course.collegeId;
    const targetCode = code ? code.toUpperCase().trim() : course.code;

    if (
      (collegeId && collegeId !== course.collegeId) ||
      (code && code.toUpperCase().trim() !== course.code)
    ) {
      const existingCourse = await db.query.courses.findFirst({
        where: and(
          eq(courses.collegeId, targetCollegeId),
          eq(courses.code, targetCode),
        ),
      });

      if (existingCourse) {
        return res
          .status(409)
          .json({ error: "Course code already exists in the target college" });
      }
    }

    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...(collegeId && { collegeId }),
        ...(code && { code: code.toUpperCase().trim() }),
        ...(name && { name: name.trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    res.json(updatedCourse);
  } catch (err) {
    console.error("[updateCourseById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /courses/:id
export async function deleteCourseById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    await db.delete(courses).where(eq(courses.id, id));

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("[deleteCourseById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
