import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from "../controllers/users.controller.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";

const router = Router();
router.get("/", requireAuth, requireRoles("admin"), getAllUsers);
router.get(
  "/:id",
  requireAuth,
  requireRoles("admin", "staff"),
  validateId,
  getUserById,
);
router.patch("/:id", requireAuth, requireRoles("admin"), updateUserById);
router.delete(
  "/:id",
  requireAuth,
  requireRoles("admin"),
  validateId,
  deleteUserById,
);

export default router;
