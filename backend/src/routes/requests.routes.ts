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
  assignRequest,
  getPublicRequestStatus,
} from "../controllers/requests.controller.js";
import {
  getRequestRoutingSteps,
  updateRoutingStepStatus,
} from "../controllers/routingSteps.controller.js";

const router = Router();

// Public unauthenticated tracking route
router.get("/public/:referenceNumber", getPublicRequestStatus);

router.use(requireAuth);

// "/me" routes must come before "/:id" or "me" is treated as an id
router.get("/me", getMyRequests);
router.get("/me/:id", validateId, getMyRequestById);
router.patch("/me/:id/cancel", validateId, cancelMyRequest);
router.post("/", createRequest);

router.get("/", requireRoles("admin", "staff"), getAllRequests);
router.get("/:id", requireRoles("admin", "staff"), validateId, getRequestById);
router.get(
  "/:id/steps",
  requireRoles("admin", "staff"),
  validateId,
  getRequestRoutingSteps,
);
router.patch(
  "/:id/steps/:stepId",
  requireRoles("admin", "staff"),
  validateId,
  updateRoutingStepStatus,
);
router.patch(
  "/:id/status",
  requireRoles("admin", "staff"),
  validateId,
  updateRequestStatus,
);
router.patch(
  "/:id/assign",
  requireRoles("admin", "staff"),
  validateId,
  assignRequest,
);

export default router;
