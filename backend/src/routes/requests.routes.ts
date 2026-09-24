import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  getAllRequests,
  getRequestById,
} from "../controllers/requests.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", requireRoles("admin", "staff"), getAllRequests);
router.get(
  "/:id",
  requireRoles("admin", "staff"),
  validateId,
  getRequestById,
);

export default router;