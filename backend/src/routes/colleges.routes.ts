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

// Read routes (Public for registration and academic catalog)
router.get("/", getAllColleges);
router.get("/:id", validateId, getCollegeById);

// Write routes (Admin only)
router.use(requireAuth);
router.post("/", requireRoles("admin"), createCollege);
router.patch("/:id", requireRoles("admin"), validateId, updateCollegeById);
router.delete("/:id", requireRoles("admin"), validateId, deleteCollegeById);

export default router;
