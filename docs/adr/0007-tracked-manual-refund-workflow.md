# 7. Tracked Manual Refund Workflow and Verify-Then-Refund Gate

Date: 2026-11-21

## Status

Accepted

## Context

Document assessment fees are settled manually through QR Ph transfers (`MariBank`, `GoTyme`, `GCash`) or cash payments at the Cashier counter, followed by **Payment Proof** image upload. Because there is no automated payment gateway API capable of programmatic charge reversals, a `payments` row with `status = "pending"` represents funds the requester already transferred externally before staff verification. Meanwhile, `cancelMyRequest` blocked all paid cancellations (`409`) with no UI cancel button, while staff `updateRequestStatus` allowed cancelling paid requests without tracking refunds or voiding issued **Official Receipt (OR) Slips**.

## Decision

1. **1-to-1 Refund Lifecycle on `payments`:** Store refund tracking fields directly on `payments` (`refund_status`, `refund_method`, `refund_account_name`, `refund_account_number`, `refund_qr_url`, `refund_proof_url`, `refund_requested_at`, `refund_payout_reference`, `refund_rejection_reason`, `refund_reviewed_by_id`, `refund_reviewed_at`) rather than introducing a separate `refunds` table, keeping payment verification and refund custody bound to the single live payment record per request.
2. **Pre-Production Requester Cancellation & Staff-Triggered Refund Claims:**
   - Requesters may self-cancel from the UI while a request is `pending` or `awaiting_payment`. If an active (`pending` or `verified`) payment exists, the cancellation modal collects a reason, preferred refund channel (`e_wallet`, `bank_transfer`, or `cash`), and optional **Receiving Refund QR Code** (`refund_qr_url` uploaded to Cloudinary `student-document-management-system/refund-qr-codes`, making text account fields optional when a QR is provided).
   - When Office Staff cancels or permanently rejects (`resubmissionAllowed = false`) a paid request, `refund_status` remains `null` so the requester sees a **Claim Refund / Reimbursement** button (`POST /api/payments/:id/claim-refund`). Requesters can also update their payout details or QR code while `refund_status = "pending"`.
3. **Verify-Then-Refund Gate & Disbursement Proof:** Cancelling or permanently rejecting a request with a `pending` payment never blindly voids the payment. Cashier staff must check bank/cashier logs against the uploaded **Payment Proof** before approving and disbursing (setting both `status = "verified"` and `refund_status = "refunded"` with `refund_payout_reference` and optional Cloudinary `refund_proof_url` under `student-document-management-system/refund-proofs`) or denying if funds never arrived (`status = "rejected"` and `refund_status = "rejected"`).
4. **Final Rejection Refund Trigger (Preserving ADR-0006):** Both `cancelled` requests and final (`resubmissionAllowed = false`) `rejected` requests with an active payment make the fee eligible for **Refund Claim**. Resubmittable rejections (`resubmissionAllowed = true`) keep the payment intact per ADR-0006.
5. **Cashier's Office (`CO`) Custody Boundary:** Only **Cashier's Office (`CO`)** staff and Admins may verify payment proofs and approve or deny refunds; issuing offices see read-only refund status.
6. **Net Revenue & Channel Deduction:** Refunded payments (`refund_status = "refunded"`) and terminated (`cancelled` / final `rejected`) requests are deducted from Dashboard `totalRevenue`, `settledTransactions`, `SectorWorkloadChart` revenue, and `PaymentMethodChart` channel counts, while tracking `refundedAmount` and `refundedTransactions` and updating review/CSV summaries.

## Consequences

### Positive
- Prevents fraudulent refunds on unverified screenshots while letting requesters cancel pre-production requests immediately.
- Preserves a single auditable payment-to-refund trail and flags refunded Official Receipt (OR) Slips as voided/refunded.

### Negative / Trade-offs
- Modelling refund fields 1-to-1 on `payments` assumes full-amount refunds per payment record; partial or split-tender refunds would require extracting a dedicated `refunds` child table later.
