import type { Request, Response } from "express";
import { and, count, eq, gte, lte, sql, ilike } from "drizzle-orm";
import { db } from "../db/db.js"; // Adjust import path
import { appointments } from "../db/schema.js"; // Adjust import path

// GET /appointments
export async function getAllAppointments(req: Request, res: Response) {
  try {
    const {
      search,
      userId,
      windowId,
      status,
      startDate,
      endDate,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20),
    );
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (userId) {
      conditions.push(eq(appointments.userId, userId as string));
    }

    if (windowId) {
      conditions.push(eq(appointments.windowId, windowId as string));
    }

    if (status) {
      conditions.push(eq(appointments.status, status as any));
    }

    if (startDate) {
      conditions.push(
        gte(appointments.scheduledAt, new Date(startDate as string)),
      );
    }

    if (endDate) {
      conditions.push(
        lte(appointments.scheduledAt, new Date(endDate as string)),
      );
    }

    if (search) {
      conditions.push(ilike(appointments.purpose, `%${search}%`));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allAppointments, totalResult] = await Promise.all([
      db.query.appointments.findMany({
        where: whereClause,
        orderBy: (appointments, { desc }) => [desc(appointments.scheduledAt)],
        limit: limitNum,
        offset,
        with: {
          user: {
            columns: { passwordHash: false },
          },
          window: true,
          request: true,
        },
      }),
      db.select({ total: count() }).from(appointments).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allAppointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllAppointments] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /appointments/:id
export async function getAppointmentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        user: {
          columns: { passwordHash: false },
        },
        window: true,
        request: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error("[getAppointmentById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /appointments/me
export async function getMyAppointments(req: Request, res: Response) {
  try {
    const sessionUserId = req.session.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20),
    );
    const offset = (pageNum - 1) * limitNum;

    const whereClause = eq(appointments.userId, sessionUserId);

    const [myAppointments, totalResult] = await Promise.all([
      db.query.appointments.findMany({
        where: whereClause,
        orderBy: (appointments, { desc }) => [desc(appointments.scheduledAt)],
        limit: limitNum,
        offset,
        with: {
          window: true,
          request: true,
        },
      }),
      db.select({ total: count() }).from(appointments).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: myAppointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getMyAppointments] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /appointments
export async function createAppointment(req: Request, res: Response) {
  try {
    const sessionUserId = req.session.userId;
    const sessionRole = req.session.role;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId: bodyUserId, windowId, requestId, purpose, scheduledAt } = req.body;
    const effectiveUserId =
      sessionRole === "admin" && bodyUserId ? bodyUserId : sessionUserId;

    if (!effectiveUserId || !windowId || !scheduledAt) {
      return res.status(400).json({
        error: "Window ID and scheduledAt timestamp are required",
      });
    }

    const scheduledDate = new Date(scheduledAt);

    // Check if the window slot is already booked
    const existingSlot = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.windowId, windowId),
        eq(appointments.scheduledAt, scheduledDate),
        eq(appointments.status, "booked"),
      ),
    });

    if (existingSlot) {
      return res.status(409).json({
        error: "This window slot is already booked for the selected time",
      });
    }

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        userId: effectiveUserId,
        windowId,
        requestId: requestId || null,
        purpose: purpose ? purpose.trim() : null,
        scheduledAt: scheduledDate,
        status: "booked",
      })
      .returning();

    res.status(201).json(newAppointment);
  } catch (err: any) {
    // Catch Postgres unique constraint violation error code
    if (err.code === "23505") {
      return res.status(409).json({
        error: "This window slot is already booked for the selected time",
      });
    }
    console.error("[createAppointment] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /appointments/:id
export async function updateAppointmentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;
    const { windowId, requestId, purpose, scheduledAt, status } = req.body;

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const targetWindowId = windowId || appointment.windowId;
    const targetScheduledAt = scheduledAt
      ? new Date(scheduledAt)
      : appointment.scheduledAt;
    const targetStatus = status || appointment.status;

    // Check slot availability if windowId, time, or status is changed back to booked
    if (
      (windowId && windowId !== appointment.windowId) ||
      (scheduledAt &&
        new Date(scheduledAt).getTime() !==
          appointment.scheduledAt.getTime()) ||
      (status === "booked" && appointment.status !== "booked")
    ) {
      if (targetStatus === "booked") {
        const existingSlot = await db.query.appointments.findFirst({
          where: and(
            eq(appointments.windowId, targetWindowId),
            eq(appointments.scheduledAt, targetScheduledAt),
            eq(appointments.status, "booked"),
            sql`${appointments.id} != ${id}`,
          ),
        });

        if (existingSlot) {
          return res.status(409).json({
            error:
              "The chosen window slot is already booked by another appointment",
          });
        }
      }
    }

    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        ...(windowId && { windowId }),
        ...(requestId !== undefined && { requestId }),
        ...(purpose !== undefined && { purpose }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(status && { status }),
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    res.json(updatedAppointment);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        error:
          "The chosen window slot is already booked by another appointment",
      });
    }
    console.error("[updateAppointmentById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /appointments/:id
export async function deleteAppointmentById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    await db.delete(appointments).where(eq(appointments.id, id));

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("[deleteAppointmentById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
