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

// Read routes (Public for registration and academic catalog)
router.get("/", getAllCourses);
router.get("/:id", validateId, getCourseById);

// Write routes (Admin only)
router.use(requireAuth);
router.post("/", requireRoles("admin"), createCourse);
router.patch("/:id", requireRoles("admin"), validateId, updateCourseById);
router.delete("/:id", requireRoles("admin"), validateId, deleteCourseById);

export default router;
