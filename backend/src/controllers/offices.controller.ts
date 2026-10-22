import type { Request, Response } from "express";
import { and, asc, count, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  documentRequests,
  documentTypes,
  offices,
  officeCategoryEnum,
  officeEnum,
  officeSectorEnum,
  users,
} from "../db/schema.js";

const SECTORS = officeSectorEnum.enumValues;
const CATEGORIES = officeCategoryEnum.enumValues;

export async function getAllOffices(req: Request, res: Response) {
  try {
    const { sector, category, search, isActive, activeOnly } = req.query;

    const conditions = [];

    if (
      typeof sector === "string" &&
      (SECTORS as readonly string[]).includes(sector.toUpperCase())
    ) {
      conditions.push(
        eq(offices.sector, sector.toUpperCase() as (typeof SECTORS)[number]),
      );
    }

    if (
      typeof category === "string" &&
      (CATEGORIES as readonly string[]).includes(category.toUpperCase())
    ) {
      conditions.push(
        eq(
          offices.category,
          category.toUpperCase() as (typeof CATEGORIES)[number],
        ),
      );
    }

    if (typeof isActive === "string") {
      conditions.push(eq(offices.isActive, isActive === "true"));
    }

    if (typeof search === "string" && search.trim()) {
      const pattern = `%${search.trim()}%`;
      conditions.push(
        or(ilike(offices.code, pattern), ilike(offices.name, pattern)),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: offices.id,
        code: offices.code,
        name: offices.name,
        sector: offices.sector,
        category: offices.category,
        officialEmail: offices.officialEmail,
        parentOfficeId: offices.parentOfficeId,
        isActive: offices.isActive,
        createdAt: offices.createdAt,
        updatedAt: offices.updatedAt,
        activeDocumentCount: count(documentTypes.id),
      })
      .from(offices)
      .leftJoin(
        documentTypes,
        and(
          eq(documentTypes.officeId, offices.id),
          eq(documentTypes.isActive, true),
        ),
      )
      .where(whereClause)
      .groupBy(offices.id)
      .orderBy(asc(offices.code));

    let data = rows.map((r) => ({
      ...r,
      activeDocumentCount: Number(r.activeDocumentCount) || 0,
    }));

    if (activeOnly === "true") {
      data = data.filter((o) => o.activeDocumentCount > 0);
    }

    return res.json({ data, total: data.length });
  } catch (err) {
    console.error("[getAllOffices] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOfficeByIdOrCode(
  req: Request<{ idOrCode: string }>,
  res: Response,
) {
  try {
    const idOrCode = req.params.idOrCode;
    if (typeof idOrCode !== "string") {
      return res.status(400).json({ error: "Invalid office identifier" });
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrCode,
      );

    const office = await db.query.offices.findFirst({
      where: (table, { eq }) =>
        isUuid
          ? eq(table.id, idOrCode)
          : eq(table.code, idOrCode.toUpperCase()),
      with: {
        childOffices: true,
      },
    });

    if (!office) {
      return res.status(404).json({ error: "Office not found" });
    }

    return res.json(office);
  } catch (err) {
    console.error("[getOfficeByIdOrCode] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getSectorMetrics(
  req: Request<{ sectorId: string }>,
  res: Response,
) {
  try {
    const sectorId = req.params.sectorId;
    if (typeof sectorId !== "string") {
      return res.status(400).json({ error: "Invalid sector ID" });
    }

    const normalizedSector = sectorId.toUpperCase();

    if (!(SECTORS as readonly string[]).includes(normalizedSector)) {
      return res.status(400).json({ error: "Invalid sector ID" });
    }

    const sectorOffices = await db.query.offices.findMany({
      where: (table, { and, eq }) =>
        and(
          eq(table.sector, normalizedSector as (typeof SECTORS)[number]),
          eq(table.isActive, true),
        ),
      orderBy: (table, { asc }) => [asc(table.code)],
    });

    const officeIds = sectorOffices.map((o) => o.id);

    // Single aggregated query across all offices in sector
    const counts =
      officeIds.length > 0
        ? await db
            .select({
              officeId: documentTypes.officeId,
              status: documentRequests.status,
              count: count(),
            })
            .from(documentRequests)
            .innerJoin(
              documentTypes,
              eq(documentRequests.documentTypeId, documentTypes.id),
            )
            .where(inArray(documentTypes.officeId, officeIds))
            .groupBy(documentTypes.officeId, documentRequests.status)
        : [];

    const countMap: Record<string, Record<string, number>> = {};
    for (const row of counts) {
      if (!row.officeId) continue;
      const officeMap = countMap[row.officeId] ?? (countMap[row.officeId] = {});
      officeMap[row.status] = Number(row.count);
    }

    const officeMetrics = sectorOffices.map((office) => {
      const statusMap = countMap[office.id] ?? {};
      return {
        officeId: office.id,
        code: office.code,
        name: office.name,
        category: office.category,
        pending: statusMap["pending"] ?? 0,
        processing: statusMap["processing"] ?? 0,
        ready: statusMap["ready"] ?? 0,
        claimed: statusMap["claimed"] ?? 0,
        total: Object.values(statusMap).reduce((acc, n) => acc + n, 0),
      };
    });

    return res.json({ sector: normalizedSector, offices: officeMetrics });
  } catch (err) {
    console.error("[getSectorMetrics] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOfficeStaff(
  req: Request<{ idOrCode: string }>,
  res: Response,
) {
  try {
    const idOrCode = req.params.idOrCode;
    if (typeof idOrCode !== "string") {
      return res.status(400).json({ error: "Invalid office identifier" });
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrCode,
      );

    const office = await db.query.offices.findFirst({
      where: (table, { eq }) =>
        isUuid
          ? eq(table.id, idOrCode)
          : eq(table.code, idOrCode.toUpperCase()),
      columns: { id: true, code: true, name: true },
    });

    if (!office) {
      return res.status(404).json({ error: "Office not found" });
    }

    const officeEnumValues = officeEnum.enumValues as readonly string[];
    const legacyOffice =
      office.code.toUpperCase() === "OUR"
        ? "registrar"
        : office.code.toUpperCase() === "HRMO"
          ? "hr"
          : officeEnumValues.includes(office.code.toLowerCase())
            ? office.code.toLowerCase()
            : null;

    const officeConditions = [eq(users.officeId, office.id)];
    if (legacyOffice) {
      officeConditions.push(eq(users.office, legacyOffice as (typeof officeEnum.enumValues)[number]));
    }

    const staffUsers = await db.query.users.findMany({
      where: and(
        eq(users.role, "staff"),
        eq(users.isActive, true),
        officeConditions.length === 1
          ? officeConditions[0]
          : or(...officeConditions),
      ),
      columns: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        office: true,
        officeId: true,
        department: true,
      },
      orderBy: (table, { asc }) => [asc(table.fullName)],
    });

    return res.json(staffUsers);
  } catch (err) {
    console.error("[getOfficeStaff] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

