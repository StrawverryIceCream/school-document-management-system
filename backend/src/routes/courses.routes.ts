import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createCourse,
  deleteCourseById,
  getAllCourses,
  getCourseById,
  updateCourseById,
} from "../controllers/courses.controller.js";

const router = Router();

// Protect all routes
router.use(requireAuth);

// Read routes (Accessible by staff & admin)
router.get("/", requireRoles("admin", "staff"), getAllCourses);
router.get("/:id", requireRoles("admin", "staff"), validateId, getCourseById);

// Write routes (Admin only)
router.post("/", requireRoles("admin"), createCourse);
router.patch("/:id", requireRoles("admin"), validateId, updateCourseById);
router.delete("/:id", requireRoles("admin"), validateId, deleteCourseById);

export default router;
