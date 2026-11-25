/// <reference types="node" />

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
    assert.equal(res.data.handoffDetails, undefined);
    assert.match(res.data.remarks, /Claimed by student \(Self\)/);
    assert.match(res.data.remarks, /Student ID #2023-01456 verified/);
  });

  it("validates successful proxy pickup with representative name and authorization notes", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      studentName: "Juan Dela Cruz",
      idType: "SSS ID",
      idNumber: "1234567890",
    });

    assert.equal(res.valid, true);
    assert.deepEqual(res.errors, {});
    assert.ok(res.data);
    assert.equal(res.data.claimedBy, "Maria Dela Cruz");
    assert.deepEqual(res.data.handoffDetails, {
      pickupType: "proxy",
      fullName: "Maria Dela Cruz",
      idType: "SSS ID",
      idNumber: "1234567890",
    });
    assert.match(res.data.remarks, /authorized proxy: Maria Dela Cruz/);
  });

  it("rejects proxy pickup without representative name", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "   ",
      studentName: "Juan Dela Cruz",
      idType: "SSS ID",
      idNumber: "1234567890",
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.claimantName);
    assert.equal(res.data, undefined);
  });

  it("rejects proxy pickup without an ID type", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      studentName: "Juan Dela Cruz",
      idNumber: "1234567890",
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.idType);
    assert.equal(res.data, undefined);
  });

  it("rejects proxy pickup without an ID number", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      studentName: "Juan Dela Cruz",
      idType: "SSS ID",
      idNumber: "   ",
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.idNumber);
    assert.equal(res.data, undefined);
  });

  it("rejects an ID type not offered by the authorized proxy selector", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      idType: "Invalid ID",
      idNumber: "1234567890",
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.idType);
    assert.equal(res.data, undefined);
  });

  it("allows self pickup without proxy ID details", () => {
    const res = validateClaimHandoff({
      pickupType: "self",
      claimantName: "Juan Dela Cruz",
    });

    assert.equal(res.valid, true);
    assert.deepEqual(res.errors, {});
    assert.equal(res.data?.handoffDetails, undefined);
  });

  it("allows optional verification notes for proxy pickup", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      idType: "SSS ID",
      idNumber: "1234567890",
    });

    assert.equal(res.valid, true);
    assert.ok(res.data);
    assert.equal(res.data.remarks, "[Counter Release] Claimed by authorized proxy: Maria Dela Cruz");
  });

  it("includes optional proxy verification notes in the remarks", () => {
    const res = validateClaimHandoff({
      pickupType: "proxy",
      claimantName: "Maria Dela Cruz",
      idType: "SSS ID",
      idNumber: "1234567890",
      notes: "Authorization letter presented",
    });

    assert.equal(res.valid, true);
    assert.ok(res.data);
    assert.match(res.data.remarks, /Authorization letter presented/);
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
