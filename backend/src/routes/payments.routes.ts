// routes/payments.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createPayment,
  getAllPayments,
  getMyPaymentById,
  getMyPayments,
  getPaymentById,
} from "../controllers/payments.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createPayment);
router.get("/me", getMyPayments);
router.get("/me/:id", validateId, getMyPaymentById);

router.get("/", requireRoles("admin", "staff"), getAllPayments);
router.get("/:id", requireRoles("admin", "staff"), validateId, getPaymentById);

export default router;