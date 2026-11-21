import assert from "node:assert/strict";
import { normalizeDocumentCreateOptions } from "../lib/document-create-options.js";

console.log("Running document creation option tests...");

assert.deepEqual(normalizeDocumentCreateOptions({}), {
  success: true,
  options: {
    category: "student",
    allowedCategories: ["student"],
    processingDays: 3,
    maxCopies: 1,
  },
});

assert.deepEqual(
  normalizeDocumentCreateOptions({
    category: "teacher",
    allowedCategories: ["teacher", "staff", "teacher"],
    processingDays: 0,
    maxCopies: 4,
  }),
  {
    success: true,
    options: {
      category: "teacher",
      allowedCategories: ["teacher", "staff"],
      processingDays: 0,
      maxCopies: 4,
    },
  },
);

assert.equal(
  normalizeDocumentCreateOptions({
    allowedCategories: [],
  }).success,
  false,
);
assert.equal(
  normalizeDocumentCreateOptions({
    allowedCategories: ["admin"],
  }).success,
  false,
);
assert.equal(
  normalizeDocumentCreateOptions({
    allowedCategories: ["student"],
    processingDays: -1,
  }).success,
  false,
);
assert.equal(
  normalizeDocumentCreateOptions({
    allowedCategories: ["student"],
    maxCopies: 0,
  }).success,
  false,
);

console.log("Document creation option tests passed!");
