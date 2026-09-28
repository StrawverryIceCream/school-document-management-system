// routes/requests.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  cancelMyRequest,
  createRequest,
  getAllRequests,
  getMyRequestById,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
} from "../controllers/requests.controller.js";

const router = Router();

router.use(requireAuth);

// "/me" routes must come before "/:id" or "me" is treated as an id
router.get("/me", getMyRequests);
router.get("/me/:id", validateId, getMyRequestById);
router.patch("/me/:id/cancel", validateId, cancelMyRequest);
router.post("/", createRequest);

router.get("/", requireRoles("admin", "staff"), getAllRequests);
router.get("/:id", requireRoles("admin", "staff"), validateId, getRequestById);
router.patch(
  "/:id/status",
  requireRoles("admin", "staff"),
  validateId,
  updateRequestStatus,
);

export default router;
