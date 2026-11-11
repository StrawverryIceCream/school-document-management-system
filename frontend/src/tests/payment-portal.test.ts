import assert from "node:assert";
import test from "node:test";
import {
  PAYMENT_PORTALS,
  MARIBANK_PAYMENT_CONFIG,
  getInitialPortal,
  getPortalPaymentDetails,
  formatPhoneNumber,
} from "../lib/payment-portal";

test("payment-portal config and helpers", async (t) => {
  await t.test("PAYMENT_PORTALS contains MariBank as first banking option", () => {
    const maribank = PAYMENT_PORTALS.find((p) => p.id === "maribank");
    assert.ok(maribank, "MariBank portal must be configured");
    assert.strictEqual(maribank.value, "bank_transfer");
    assert.strictEqual(maribank.label, "MariBank");
  });

  await t.test("getInitialPortal prioritizes MariBank for bank_transfer", () => {
    assert.strictEqual(getInitialPortal("bank_transfer"), "maribank");
    assert.strictEqual(getInitialPortal("card"), "card");
    assert.strictEqual(getInitialPortal("e_wallet"), "gcash");
  });

  await t.test("formatPhoneNumber formats 11-digit PH mobile numbers", () => {
    assert.strictEqual(
      formatPhoneNumber("09773254633"),
      "+63 977 325 4633",
    );
    assert.strictEqual(
      formatPhoneNumber("09123456789"),
      "+63 912 345 6789",
    );
    // fallback if non-matching
    assert.strictEqual(formatPhoneNumber("123"), "123");
  });

  await t.test("MARIBANK_PAYMENT_CONFIG contains verified details and QR path", () => {
    assert.strictEqual(MARIBANK_PAYMENT_CONFIG.accountNumber, "09773254633");
    assert.strictEqual(
      MARIBANK_PAYMENT_CONFIG.formattedNumber,
      "+63 977 325 4633",
    );
    assert.strictEqual(
      MARIBANK_PAYMENT_CONFIG.qrImagePath,
      "/images/payment/qr.jpg",
    );
    assert.strictEqual(MARIBANK_PAYMENT_CONFIG.bankName, "MariBank");
  });

  await t.test("getPortalPaymentDetails returns MariBank details for maribank and QR Ph channels", () => {
    const details = getPortalPaymentDetails("maribank");
    assert.ok(details);
    assert.strictEqual(details.accountNumber, "09773254633");
    assert.strictEqual(details.qrImagePath, "/images/payment/qr.jpg");
    assert.strictEqual(details.isQrPhCompatible, true);

    const gcashDetails = getPortalPaymentDetails("gcash");
    assert.ok(gcashDetails);
    assert.strictEqual(gcashDetails.isQrPhCompatible, true);
  });
});
