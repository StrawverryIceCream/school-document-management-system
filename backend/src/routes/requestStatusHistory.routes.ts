import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createRequestStatusHistory,
  deleteRequestStatusHistoryById,
  getAllRequestStatusHistory,
  getRequestStatusHistoryById,
  updateRequestStatusHistoryById,
} from "../controllers/requestStatusHistory.controller.js";

const router = Router();

// Secure all routes
router.use(requireAuth);

// Accessible by admin and staff
router.get("/", requireRoles("admin", "staff"), getAllRequestStatusHistory);
router.get("/:id", requireRoles("admin", "staff"), validateId, getRequestStatusHistoryById);
router.post("/", requireRoles("admin", "staff"), createRequestStatusHistory);

// Highly restricted write routes (Admins only, if used at all)
router.patch("/:id", requireRoles("admin"), validateId, updateRequestStatusHistoryById);
router.delete("/:id", requireRoles("admin"), validateId, deleteRequestStatusHistoryById);

export default router;