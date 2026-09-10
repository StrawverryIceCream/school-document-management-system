import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getAllUsers,
  getUserById,
  updateUserById,
} from "../controllers/users.controller.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";

const router = Router();
router.get("/", requireAuth, requireRoles("admin"), getAllUsers);
router.get("/:id", requireAuth, validateId, getUserById);
router.patch("/:id", requireAuth, requireRoles("admin"), updateUserById);
export default router;
