import assert from "node:assert";
import {
  escapeCsvValue,
  serializeToCsv,
  type ExportColumn,
} from "../lib/export/csv-export.js";

console.log("Running CSV serialization unit tests...");

// 1. Escaping tests
assert.strictEqual(escapeCsvValue("SimpleText"), "SimpleText");
assert.strictEqual(escapeCsvValue(123), "123");
assert.strictEqual(escapeCsvValue(true), "true");
assert.strictEqual(escapeCsvValue(null), "");
assert.strictEqual(escapeCsvValue(undefined), "");

// Quotes and commas
assert.strictEqual(escapeCsvValue("Hello, World"), '"Hello, World"');
assert.strictEqual(escapeCsvValue('He said "Hello"'), '"He said ""Hello"""');
assert.strictEqual(escapeCsvValue("Line1\nLine2"), '"Line1\nLine2"');
assert.strictEqual(escapeCsvValue('Quote "and" comma, here\nnewline'), '"Quote ""and"" comma, here\nnewline"');

// 2. Table serialization tests
interface TestRow {
  id: string;
  name: string;
  role: string;
  amount: number | null;
  notes?: string;
}

const columns: ExportColumn<TestRow>[] = [
  { header: "ID", key: "id" },
  { header: "Full Name", key: "name" },
  { header: "Role", key: "role", formatter: (val) => String(val).toUpperCase() },
  { header: "Amount Due", key: "amount", formatter: (val) => (val !== null ? `PHP ${val.toFixed(2)}` : "Free") },
  { header: "Notes", key: "notes" },
];

const testData: TestRow[] = [
  { id: "1", name: "Juan Dela Cruz", role: "student", amount: 150, notes: 'URGENT "Dean\'s List"' },
  { id: "2", name: "Maria Clara, Jr.", role: "staff", amount: null, notes: "No, notes here\nNext line" },
];

const csvOutput = serializeToCsv(testData, columns);
const expectedRows = [
  "ID,Full Name,Role,Amount Due,Notes",
  '1,Juan Dela Cruz,STUDENT,PHP 150.00,"URGENT ""Dean\'s List"""',
  '2,"Maria Clara, Jr.",STAFF,Free,"No, notes here\nNext line"',
];

assert.strictEqual(csvOutput, expectedRows.join("\r\n"));

// 3. Empty dataset test
const emptyOutput = serializeToCsv([], columns);
assert.strictEqual(emptyOutput, "ID,Full Name,Role,Amount Due,Notes");

console.log("CSV serialization unit tests passed successfully!");
