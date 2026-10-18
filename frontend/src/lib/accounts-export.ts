import type { User } from "@/types";

type CsvColumn = {
  header: string;
  getValue: (user: User) => string;
};

const EXPORT_FILENAME_PREFIX = "accounts";
const ISO_DATE_LENGTH = 10;
// Excel needs a BOM to read UTF-8 names with accents correctly
const UTF8_BOM = "\uFEFF";
const CSV_LINE_BREAK = "\r\n";

// Cells starting with these characters run as formulas when opened in Excel
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export const CSV_COLUMNS: CsvColumn[] = [
  { header: "ID", getValue: (user) => user.id },
  { header: "Full name", getValue: (user) => user.fullName },
  { header: "Email", getValue: (user) => user.email },
  { header: "Role", getValue: (user) => user.role },
  { header: "Student / Staff ID", getValue: (user) => user.studentId ?? "" },
  { header: "Department", getValue: (user) => user.department ?? "" },
  { header: "College", getValue: (user) => user.collegeId ?? "" },
  { header: "Course", getValue: (user) => user.courseId ?? "" },
  { header: "Section", getValue: (user) => user.section ?? "" },
  {
    header: "Created at",
    getValue: (user) => new Date(user.createdAt).toISOString(),
  },
];

function escapeCsvCell(value: string): string {
  const safeValue = FORMULA_PREFIX.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function buildUsersCsv(users: User[]): string {
  const header = CSV_COLUMNS.map((column) => escapeCsvCell(column.header)).join(
    ",",
  );
  const rows = users.map((user) =>
    CSV_COLUMNS.map((column) => escapeCsvCell(column.getValue(user))).join(","),
  );
  return [header, ...rows].join(CSV_LINE_BREAK);
}

export function getExportFilename(): string {
  const today = new Date().toISOString().slice(0, ISO_DATE_LENGTH);
  return `${EXPORT_FILENAME_PREFIX}-${today}.csv`;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([UTF8_BOM, csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}