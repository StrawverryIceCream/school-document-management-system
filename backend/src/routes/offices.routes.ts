import { Router } from "express";
import {
  getAllOffices,
  getOfficeByIdOrCode,
  getSectorMetrics,
} from "../controllers/offices.controller.js";

const router = Router();

router.get("/", getAllOffices);
router.get("/sectors/:sectorId/metrics", getSectorMetrics);
router.get("/:idOrCode", getOfficeByIdOrCode);

export default router;
