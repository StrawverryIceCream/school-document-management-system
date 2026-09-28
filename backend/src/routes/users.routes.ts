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
router.use(requireAuth);

router.get("/", requireRoles("admin"), getAllUsers);
router.get("/:id", requireRoles("admin", "staff"), validateId, getUserById);
router.patch("/:id", requireRoles("admin"), validateId, updateUserById);
router.delete("/:id", requireRoles("admin"), validateId, deleteUserById);

export default router;
