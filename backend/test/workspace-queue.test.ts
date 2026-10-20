import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/server.js";
import { db } from "../src/db/db.js";
import { users, offices } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

describe("GET /api/requests/workspace-queue", () => {
  it("rejects unauthenticated staff access with 401", async () => {
    const res = await request(app).get("/api/requests/workspace-queue");
    expect(res.status).toBe(401);
  });

  it("returns 200 and office-scoped queue for authenticated staff", async () => {
    // 1. Get seeded OUR office
    const ourOffice = await db.query.offices.findFirst({
      where: eq(offices.code, "OUR"),
    });
    expect(ourOffice).toBeDefined();

    // 2. Create or find staff user with officeId: ourOffice.id
    const email = "our.clerk@tup.edu.ph";
    let staff = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    const passwordHash = await bcrypt.hash("Password123!", 10);
    if (!staff) {
      const [created] = await db
        .insert(users)
        .values({
          fullName: "OUR Clerk",
          email,
          passwordHash,
          role: "staff",
          office: "registrar",
          officeId: ourOffice!.id,
          isActive: true,
        })
        .returning();
      staff = created;
    } else {
      await db
        .update(users)
        .set({ office: "registrar", officeId: ourOffice!.id, role: "staff", passwordHash })
        .where(eq(users.id, staff.id));
    }

    // 3. Login using supertest agent
    const agent = request.agent(app);
    const loginRes = await agent
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });

    expect(loginRes.status).toBe(200);

    // 4. Query workspace queue
    const queueRes = await agent.get("/api/requests/workspace-queue");
    expect(queueRes.status).toBe(200);
    expect(queueRes.body).toHaveProperty("queue");
    expect(Array.isArray(queueRes.body.queue)).toBe(true);
    expect(queueRes.body.allowedOfficeIds).toContain(ourOffice!.id);
  });
});
