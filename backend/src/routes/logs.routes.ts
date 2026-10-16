import { Router } from "express";
import {
  getLogById,
  getLogs,
  getLogStats,
} from "../controllers/logs.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";

const router = Router();

router.use(requireAuth, requireRoles("admin"));

router.get("/", getLogs);
router.get("/stats", getLogStats);
router.get("/:id", validateId, getLogById);

export default router;