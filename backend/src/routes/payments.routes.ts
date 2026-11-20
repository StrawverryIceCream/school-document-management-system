// routes/payments.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  claimRefundHandler,
  createPayment,
  getAllPayments,
  getMyPaymentById,
  getMyPayments,
  getPaymentById,
  reviewPaymentHandler,
  reviewRefundHandler,
  uploadPaymentProofHandler,
} from "../controllers/payments.controller.js";
import { handleUpload } from "../middleware/upload.js";

const router = Router();

router.use(requireAuth);

router.post("/", createPayment);
router.get("/me", getMyPayments);
router.get("/me/:id", validateId, getMyPaymentById);
router.post(
  "/:id/proof",
  handleUpload("paymentProof"),
  uploadPaymentProofHandler,
);
router.post(
  "/:id/claim-refund",
  validateId,
  handleUpload("refundQr"),
  claimRefundHandler,
);

router.get("/", requireRoles("admin", "staff"), getAllPayments);
router.get("/:id", requireRoles("admin", "staff"), validateId, getPaymentById);
router.patch(
  "/:id/review",
  requireRoles("admin", "staff"),
  validateId,
  reviewPaymentHandler,
);
router.patch(
  "/:id/refund",
  requireRoles("admin", "staff"),
  validateId,
  handleUpload("refundProof"),
  reviewRefundHandler,
);

export default router;