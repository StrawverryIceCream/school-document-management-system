import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import {
  getAllOffices,
  getOfficeByIdOrCode,
  getSectorMetrics,
} from "../controllers/offices.controller.js";

const router = Router();

router.get("/", getAllOffices);
router.get(
  "/sectors/:sectorId/metrics",
  requireAuth,
  requireRoles("admin", "staff"),
  getSectorMetrics,
);
router.get("/:idOrCode", getOfficeByIdOrCode);

export default router;
