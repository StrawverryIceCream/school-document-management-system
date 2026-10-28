import type { DocumentRequestWithRelations, DocumentType } from "@/types";

export interface ExportColumn<T> {
  header: string;
  key: keyof T | string;
  formatter?: (value: any, row: T) => string;
}

export const requestExportColumns: ExportColumn<DocumentRequestWithRelations>[] = [
  { header: "Reference Number", key: "referenceNumber" },
  { header: "Tracking ID", key: "id" },
  {
    header: "Requester Name",
    key: "user",
    formatter: (_, req) => req.user?.fullName || "—",
  },
  {
    header: "Student / Employee ID",
    key: "user",
    formatter: (_, req) => req.user?.studentId || "—",
  },
  {
    header: "Role",
    key: "user",
    formatter: (_, req) => req.user?.role || "—",
  },
  {
    header: "College",
    key: "user",
    formatter: (_, req) => req.user?.college?.code || "—",
  },
  {
    header: "Department",
    key: "user",
    formatter: (_, req) => req.user?.department || "—",
  },
  { header: "Document Type", key: "documentTypeName" },
  { header: "Document Code", key: "documentTypeCode" },
  { header: "Copies", key: "copies" },
  { header: "Purpose", key: "purpose", formatter: (val) => val || "—" },
  { header: "Amount Due (PHP)", key: "amountDue" },
  { header: "Status", key: "status" },
  {
    header: "Assignee",
    key: "assignee",
    formatter: (_, req) => req.assignee?.fullName || "Unassigned",
  },
  { header: "Claimed By", key: "claimedBy", formatter: (val) => val || "—" },
  {
    header: "Date Requested",
    key: "createdAt",
    formatter: (val) => (val ? new Date(val).toISOString().slice(0, 10) : "—"),
  },
  { header: "Release Date", key: "releaseDate", formatter: (val) => val || "—" },
];

export const documentExportColumns: ExportColumn<DocumentType>[] = [
  { header: "Document Code", key: "code" },
  { header: "Document Name", key: "name" },
  {
    header: "Office",
    key: "officeRecord",
    formatter: (_, doc) => doc.officeRecord?.code || doc.office || "—",
  },
  {
    header: "Sector",
    key: "officeRecord",
    formatter: (_, doc) => doc.officeRecord?.sector || "—",
  },
  {
    header: "Fee (PHP)",
    key: "fee",
    formatter: (val) => (val ? Number(val).toFixed(2) : "0.00"),
  },
  { header: "Turnaround (Days)", key: "processingDays" },
  { header: "Max Copies", key: "maxCopies" },
  {
    header: "Status",
    key: "isActive",
    formatter: (val) => (val ? "Active" : "Inactive"),
  },
  { header: "Category", key: "category" },
  { header: "Description", key: "description", formatter: (val) => val || "" },
];

export interface RequestRowExportable {
  id: string;
  referenceNumber?: string;
  applicant: string;
  studentId?: string | null;
  document: string;
  status: string;
  submittedAt?: string | null;
  releaseDate?: string | null;
  claimedAt?: string | null;
  purpose?: string | null;
  amountDue?: string;
  officeCode?: string | null;
  collegeName?: string | null;
  assignee?: { fullName?: string } | null;
}

export const requestRowExportColumns: ExportColumn<RequestRowExportable>[] = [
  { header: "Reference Number", key: "referenceNumber", formatter: (val) => val || "—" },
  { header: "Tracking ID", key: "id" },
  { header: "Requester Name", key: "applicant" },
  { header: "Student ID", key: "studentId", formatter: (val) => val || "—" },
  { header: "Document Type", key: "document" },
  { header: "Office", key: "officeCode", formatter: (val) => val || "—" },
  { header: "College", key: "collegeName", formatter: (val) => val || "—" },
  { header: "Purpose", key: "purpose", formatter: (val) => val || "—" },
  {
    header: "Amount Due (PHP)",
    key: "amountDue",
    formatter: (val) => (val ? Number(val).toFixed(2) : "0.00"),
  },
  { header: "Status", key: "status" },
  {
    header: "Assignee",
    key: "assignee",
    formatter: (_, req) => req.assignee?.fullName || "Unassigned",
  },
  { header: "Claimed At", key: "claimedAt", formatter: (val) => val || "—" },
  {
    header: "Date Requested",
    key: "submittedAt",
    formatter: (val) => (val ? new Date(val).toISOString().slice(0, 10) : "—"),
  },
  { header: "Release Date", key: "releaseDate", formatter: (val) => val || "—" },
];

/**
 * Escapes a scalar value according to RFC 4180 rules.
 * Values containing commas, double quotes, or newlines are wrapped in double quotes,
 * and internal double quotes are escaped as two double quotes ("").
 */
export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes an array of records to an RFC 4180 compliant CSV string.
 */
export function serializeToCsv<T>(
  data: T[],
  columns: ExportColumn<T>[],
): string {
  const headerRow = columns.map((c) => escapeCsvValue(c.header)).join(",");
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const rawValue = (row as any)[col.key];
        const formatted = col.formatter ? col.formatter(rawValue, row) : rawValue;
        return escapeCsvValue(formatted);
      })
      .join(","),
  );

  return [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a browser download for the generated CSV string.
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel UTF-8 compatibility
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Convenience helper to serialize and download in one step.
 */
export function exportToCsv<T>(
  filename: string,
  data: T[],
  columns: ExportColumn<T>[],
): void {
  const csv = serializeToCsv(data, columns);
  downloadCsv(filename, csv);
}
