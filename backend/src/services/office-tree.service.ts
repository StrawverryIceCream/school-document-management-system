import { db } from "../db/db.js";
import { offices } from "../db/schema.js";

type CachedOffice = {
  id: string;
  code: string;
  name: string;
  parentOfficeId: string | null;
  isActive: boolean;
};

let cachedOffices: CachedOffice[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export async function loadOfficesCache(forceRefresh = false): Promise<CachedOffice[]> {
  const now = Date.now();
  if (!forceRefresh && cachedOffices && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedOffices;
  }

  const rows = await db.query.offices.findMany({
    columns: {
      id: true,
      code: true,
      name: true,
      parentOfficeId: true,
      isActive: true,
    },
  });

  cachedOffices = rows;
  lastCacheTime = now;
  return cachedOffices;
}

export function invalidateOfficeTreeCache(): void {
  cachedOffices = null;
  lastCacheTime = 0;
}

export async function getDescendantOfficeIds(officeId: string): Promise<string[]> {
  const allOffices = await loadOfficesCache();
  const result: string[] = [officeId];
  const queue: string[] = [officeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const directChildren = allOffices.filter(
      (o) => o.parentOfficeId === currentId && o.isActive
    );
    for (const child of directChildren) {
      result.push(child.id);
      queue.push(child.id);
    }
  }

  return result;
}
