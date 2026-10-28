import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateClaimHandoff,
  formatClaimHandoffProvenance,
} from "../lib/requests/claim-handoff";

describe("claim-handoff", () => {
  it("validates successful student self pickup with default student name", () => {
    const res = validateClaimHandoff({
      pickupType: "self",
      claimantName: "",
      studentName: "Juan Dela Cruz",
      notes: "Student ID #2023-01456 verified",
    });

    assert.equal(res.valid, true);
    assert.deepEqual(res.errors, {});
    assert.ok(res.data);
    assert.equal(res.data.claimedBy, "Juan Dela Cruz");
    assert.match(res.data.remarks, /Claimed by student \(Self\)/);
    assert.match(res.data.remarks, /Student ID #2023-01456 verified/);
  });

  it("validates successful proxy pickup with representative name and authorization notes", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      studentName: "Juan Dela Cruz",
      notes: "Authorization letter dated 2026-10-20 & UMID ID presented",
    });

    assert.equal(res.valid, true);
    assert.deepEqual(res.errors, {});
    assert.ok(res.data);
    assert.equal(res.data.claimedBy, "Maria Dela Cruz");
    assert.match(res.data.remarks, /authorized proxy: Maria Dela Cruz/);
    assert.match(res.data.remarks, /UMID ID presented/);
  });

  it("rejects proxy pickup without representative name", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "   ",
      studentName: "Juan Dela Cruz",
      notes: "Authorization letter presented",
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.claimantName);
    assert.equal(res.data, undefined);
  });

  it("rejects proxy pickup without authorization notes", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      studentName: "Juan Dela Cruz",
      notes: "   ",
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.notes);
    assert.equal(res.data, undefined);
  });

  it("formatClaimHandoffProvenance creates concise audit string", () => {
    const prov = formatClaimHandoffProvenance({
      pickupType: "proxy",
      claimantName: "Elena Ramos",
      notes: "National ID verified",
    });

    assert.equal(
      prov,
      "[Counter Release] Claimed by authorized proxy: Elena Ramos. Verification: National ID verified",
    );
  });
});
