import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/server.js";
import { db } from "../src/db/db.js";
import { users, offices } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

describe("GET /api/requests/routing-steps", () => {
  it("returns 200 and clearance steps list for staff with officeCode", async () => {
    const ourOffice = await db.query.offices.findFirst({
      where: eq(offices.code, "OUR"),
    });
    expect(ourOffice).toBeDefined();

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
    }

    const agent = request.agent(app);
    const loginRes = await agent
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });
    expect(loginRes.status).toBe(200);

    const res = await agent.get("/api/requests/routing-steps?officeCode=OUR&status=pending");
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  it("returns 200 and all clearance steps for admin with officeCode=ALL", async () => {
    const email = "superadmin@tup.edu.ph";
    let admin = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    const passwordHash = await bcrypt.hash("Password123!", 10);
    if (!admin) {
      const [created] = await db
        .insert(users)
        .values({
          fullName: "TUP Administrator",
          email,
          passwordHash,
          role: "admin",
          isActive: true,
        })
        .returning();
      admin = created;
    }

    const agent = request.agent(app);
    const loginRes = await agent
      .post("/api/auth/login")
      .send({ email, password: "Password123!" });
    expect(loginRes.status).toBe(200);

    const res = await agent.get("/api/requests/routing-steps?officeCode=ALL&status=pending");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
