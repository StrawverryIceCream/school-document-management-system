// routes/notifications.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  deleteNotification,
  getMyNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  sendNotification,
} from "../controllers/notifications.controller.js";
const router = Router();

router.use(requireAuth);
router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.post("/", requireRoles("admin", "staff"), sendNotification);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", validateId, markAsRead);
router.delete("/:id", validateId, deleteNotification);

export default router;