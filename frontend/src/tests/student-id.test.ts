import assert from "node:assert/strict";
import { formatStudentId, isValidStudentId } from "../lib/auth/format-student-id";

assert.equal(formatStudentId(""), "TUPM-");
assert.equal(formatStudentId("241234"), "TUPM-24-1234");
assert.equal(formatStudentId("tupm-24-12345"), "TUPM-24-12345");
assert.equal(formatStudentId("TUPM - 24 - 12345"), "TUPM-24-12345");
assert.equal(formatStudentId("TUPM-24-1234599"), "TUPM-24-12345");

assert.equal(isValidStudentId("TUPM-24-1234"), true);
assert.equal(isValidStudentId("TUPM-24-12345"), true);
assert.equal(isValidStudentId("tupm-24-12345"), true);
assert.equal(isValidStudentId("TUPM-"), false);
assert.equal(isValidStudentId("TUPM-24-123"), false);
assert.equal(isValidStudentId("TUPM-24-123456"), false);
assert.equal(isValidStudentId("2024-1234"), false);

console.log("student-id tests passed");
