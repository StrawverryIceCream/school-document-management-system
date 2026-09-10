import { type Request, type Response } from "express";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        passwordHash: false,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    res.json(allUsers);
  } catch (err) {
    console.error("[getAllUsers] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserById(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false, // Exclude password hash from response
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("[getUserById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
