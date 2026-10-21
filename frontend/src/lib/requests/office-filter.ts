import type { RequestRow } from "@/context/DashboardContext";

/**
 * Filters request rows by an office identifier (code, name, or ID), or returns all if 'all'.
 */
export function filterRequestsByOffice(
  rows: RequestRow[],
  officeFilter: string,
): RequestRow[] {
  if (!officeFilter || officeFilter === "all") {
    return rows;
  }

  const target = officeFilter.trim().toLowerCase();

  return rows.filter((row) => {
    const code = row.officeCode?.trim().toLowerCase();
    const name = row.officeName?.trim().toLowerCase();
    const id = row.officeId?.trim().toLowerCase();

    return code === target || name === target || id === target;
  });
}
