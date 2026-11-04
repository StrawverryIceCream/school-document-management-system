import { Router } from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";

const router = Router();

router.get("/", getSettings);
router.patch("/", requireAuth, requireRoles("admin"), updateSettings);

export default router;
