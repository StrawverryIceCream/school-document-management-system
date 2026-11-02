import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAllRequests } from "@/api/requests";
import { normalizeRequestRow } from "@/lib/requests";
import { SECTORS } from "@/lib/sectors/sectors-config";

export interface SidebarCounts {
  total: number;
  sectorCounts: Record<string, number>;
  divisionCounts: Record<string, number>;
}

let cachedCounts: SidebarCounts | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15000;

export function useSidebarCounts(): SidebarCounts {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === "admin" || user?.role === "staff";
  const [counts, setCounts] = useState<SidebarCounts>(
    cachedCounts ?? { total: 0, sectorCounts: {}, divisionCounts: {} }
  );

  useEffect(() => {
    if (!isStaffOrAdmin) return;

    const now = Date.now();
    if (cachedCounts && now - lastFetchTime < CACHE_TTL_MS) {
      setCounts(cachedCounts);
      return;
    }

    let isMounted = true;
    getAllRequests({ limit: 500 })
      .then((res) => {
        if (!isMounted) return;
        const rawRequests = res.data ?? [];
        const total = res.pagination?.total ?? rawRequests.length;
        const normalized = rawRequests.map(normalizeRequestRow);

        const sectorCounts: Record<string, number> = {};
        const divisionCounts: Record<string, number> = {};

        for (const sector of SECTORS) {
          let sCount = 0;
          for (const division of sector.divisions) {
            let dCount = 0;
            for (const office of division.offices) {
              const matched = normalized.filter((r) => {
                const offCode = office.code.toUpperCase();
                const rOffice = (r.officeCode ?? "").toUpperCase();
                if (rOffice && rOffice === offCode) return true;
                if (office.collegeCode && r.college) {
                  return r.college.toUpperCase() === office.collegeCode.toUpperCase();
                }
                if (office.docCodePrefix && r.documentTypeCode) {
                  return r.documentTypeCode.toUpperCase().startsWith(office.docCodePrefix.toUpperCase());
                }
                return false;
              }).length;
              dCount += matched;
            }
            divisionCounts[division.id] = dCount;
            sCount += dCount;
          }
          const directSectorCount = normalized.filter(
            (r) => r.sector?.toUpperCase() === sector.code.toUpperCase()
          ).length;
          sectorCounts[sector.code] = Math.max(sCount, directSectorCount);
        }

        const calculated: SidebarCounts = { total, sectorCounts, divisionCounts };
        cachedCounts = calculated;
        lastFetchTime = Date.now();
        setCounts(calculated);
      })
      .catch((err) => {
        console.error("Failed to load sidebar request counts:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isStaffOrAdmin]);

  return counts;
}
