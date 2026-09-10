// src/middleware/requireRoles.ts
import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";

type Role = "admin" | "staff" | "student" | "teacher";

export function requireRoles(...allowedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: "You do not have permission to access this resource",
      });
    }

    next();
  };
}