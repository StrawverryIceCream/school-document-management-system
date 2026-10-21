import type { Request, Response } from "express";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  documentRequests,
  documentTypes,
  offices,
  officeCategoryEnum,
  officeSectorEnum,
} from "../db/schema.js";

const SECTORS = officeSectorEnum.enumValues;
const CATEGORIES = officeCategoryEnum.enumValues;

export async function getAllOffices(req: Request, res: Response) {
  try {
    const { sector, category, search, isActive } = req.query;

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

    const data = await db.query.offices.findMany({
      where: whereClause,
      orderBy: (offices, { asc }) => [asc(offices.code)],
    });

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
    });

    const officeMetrics = await Promise.all(
      sectorOffices.map(async (office) => {
        const counts = await db
          .select({
            status: documentRequests.status,
            count: count(),
          })
          .from(documentRequests)
          .innerJoin(
            documentTypes,
            eq(documentRequests.documentTypeId, documentTypes.id),
          )
          .where(
            or(
              eq(documentTypes.officeId, office.id),
              ilike(documentRequests.documentTypeCode, `${office.code}-%`),
            ),
          )
          .groupBy(documentRequests.status);

        const statusMap = Object.fromEntries(
          counts.map((c) => [c.status, Number(c.count)]),
        );

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
      }),
    );

    return res.json({ sector: normalizedSector, offices: officeMetrics });
  } catch (err) {
    console.error("[getSectorMetrics] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
