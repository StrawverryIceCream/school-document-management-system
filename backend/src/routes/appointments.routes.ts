import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createAppointment,
  deleteAppointmentById,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentById,
} from "../controllers/appointments.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", requireRoles("admin", "staff"), getAllAppointments);
router.get("/:id", requireRoles("admin", "staff"), validateId, getAppointmentById);
router.post("/", requireRoles("admin", "staff"), createAppointment);
router.patch("/:id", requireRoles("admin", "staff"), validateId, updateAppointmentById);
router.delete("/:id", requireRoles("admin"), validateId, deleteAppointmentById);

export default router;