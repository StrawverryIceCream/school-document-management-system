import assert from "node:assert";

export function buildCollegeQueryFilter(collegeCode: string) {
  return {
    matchedField: "colleges.code",
    value: collegeCode.trim().toUpperCase(),
  };
}

console.log("Running request filter optimization verification...");
const filter = buildCollegeQueryFilter("CCS");
assert.strictEqual(filter.value, "CCS");
console.log("Filter verification passed!");
