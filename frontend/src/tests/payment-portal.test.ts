import assert from "node:assert";
import test from "node:test";
import {
  PAYMENT_PORTALS,
  getInitialPortal,
  getPortalPaymentDetails,
  formatPhoneNumber,
} from "../lib/payment-portal";

test("payment-portal config and helpers", async (t) => {
  await t.test("PAYMENT_PORTALS contains MariBank, GoTyme, BDO, and GCash", () => {
    assert.strictEqual(PAYMENT_PORTALS.length, 4);
    const ids = PAYMENT_PORTALS.map((p) => p.id);
    assert.deepStrictEqual(ids, ["maribank", "gotyme", "bdo", "gcash"]);

    const maribank = PAYMENT_PORTALS.find((p) => p.id === "maribank");
    assert.strictEqual(maribank?.value, "bank_transfer");

    const gotyme = PAYMENT_PORTALS.find((p) => p.id === "gotyme");
    assert.strictEqual(gotyme?.value, "bank_transfer");
    assert.strictEqual(gotyme?.label, "GoTyme");

    const bdo = PAYMENT_PORTALS.find((p) => p.id === "bdo");
    assert.strictEqual(bdo?.value, "bank_transfer");
    assert.strictEqual(bdo?.label, "BDO");

    const gcash = PAYMENT_PORTALS.find((p) => p.id === "gcash");
    assert.strictEqual(gcash?.value, "e_wallet");
  });

  await t.test("getInitialPortal routes to maribank or gcash", () => {
    assert.strictEqual(getInitialPortal("bank_transfer"), "maribank");
    assert.strictEqual(getInitialPortal("e_wallet"), "gcash");
    assert.strictEqual(getInitialPortal("card"), "maribank");
  });

  await t.test("formatPhoneNumber formats 11-digit PH mobile numbers", () => {
    assert.strictEqual(
      formatPhoneNumber("09773254633"),
      "+63 977 325 4633",
    );
    assert.strictEqual(formatPhoneNumber("123"), "123");
  });

  await t.test("MariBank portal details include QR and no phone number", () => {
    const details = getPortalPaymentDetails("maribank");
    assert.ok(details);
    assert.strictEqual(details.bankName, "MariBank");
    assert.strictEqual(details.qrImagePath, "/images/payment/maribank_qr.jpg");
    assert.strictEqual(details.hasPhoneNumber, false);
    assert.strictEqual(details.accountNumber, undefined);
  });

  await t.test("GoTyme portal details include QR and no phone number", () => {
    const details = getPortalPaymentDetails("gotyme");
    assert.ok(details);
    assert.strictEqual(details.bankName, "GoTyme Bank");
    assert.strictEqual(details.qrImagePath, "/images/payment/gotyme_qr.jfif");
    assert.strictEqual(details.hasPhoneNumber, false);
    assert.strictEqual(details.accountNumber, undefined);
  });

  await t.test("BDO portal details include QR and no phone number", () => {
    const details = getPortalPaymentDetails("bdo");
    assert.ok(details);
    assert.strictEqual(details.bankName, "BDO");
    assert.strictEqual(details.qrImagePath, "/images/payment/bdo_qr.jpg");
    assert.strictEqual(details.hasPhoneNumber, false);
    assert.strictEqual(details.accountNumber, undefined);
  });

  await t.test("GCash portal details include QR and verified phone number", () => {
    const details = getPortalPaymentDetails("gcash");
    assert.ok(details);
    assert.strictEqual(details.bankName, "GCash");
    assert.strictEqual(details.qrImagePath, "/images/payment/gcash_qr.jfif");
    assert.strictEqual(details.hasPhoneNumber, true);
    assert.strictEqual(details.accountNumber, "09773254633");
    assert.strictEqual(details.formattedNumber, "+63 977 325 4633");
  });
});
