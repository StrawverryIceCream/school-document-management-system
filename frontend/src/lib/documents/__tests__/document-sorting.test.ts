import { sortDocumentsAlphabetically } from "../documents";

function assertEqual(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
    );
  }
}

const documents = [
  { name: "Service Record", id: "3" },
  { name: "application for leave", id: "1" },
  { name: "Certificate of Employment", id: "2" },
];

assertEqual(
  sortDocumentsAlphabetically(documents).map((document) => document.id),
  ["1", "2", "3"],
);
assertEqual(
  documents.map((document) => document.id),
  ["3", "1", "2"],
);
