import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createCollege,
  deleteCollegeById,
  getAllColleges,
  getCollegeById,
  updateCollegeById,
} from "../controllers/colleges.controller.js";

const router = Router();

// Protect all routes
router.use(requireAuth);

// Read routes (Accessible by staff & admin)
router.get("/", requireRoles("admin", "staff"), getAllColleges);
router.get("/:id", requireRoles("admin", "staff"), validateId, getCollegeById);

// Write routes (Admin only)
router.post("/", requireRoles("admin"), createCollege);
router.patch("/:id", requireRoles("admin"), validateId, updateCollegeById);
router.delete("/:id", requireRoles("admin"), validateId, deleteCollegeById);

export default router;
