import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createAnnouncement,
  deleteAnnouncementById,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncementById,
} from "../controllers/announcements.controller.js";

const router = Router();

router.use(requireAuth);

// Anyone authenticated can read announcements
router.get("/", getAllAnnouncements);
router.get("/:id", validateId, getAnnouncementById);

// Only admins and staff can manage announcements
router.post("/", requireRoles("admin", "staff"), createAnnouncement);
router.patch("/:id", requireRoles("admin", "staff"), validateId, updateAnnouncementById);
router.delete("/:id", requireRoles("admin", "staff"), validateId, deleteAnnouncementById);

export default router;