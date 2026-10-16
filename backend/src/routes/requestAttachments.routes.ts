import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
import {
  createRequestAttachment,
  deleteRequestAttachmentById,
  getAllRequestAttachments,
  getRequestAttachmentById,
  updateRequestAttachmentById,
} from "../controllers/requestAttachments.controller.js";

const router = Router();

// Secure all routes
router.use(requireAuth);

// Accessible by any authenticated user (e.g. students viewing their own request attachments)
router.get("/", getAllRequestAttachments);
router.get("/:id", validateId, getRequestAttachmentById);
router.post("/", createRequestAttachment);

// Restricted modification routes
router.patch("/:id", validateId, updateRequestAttachmentById);
// You may want to restrict deletion to admins/staff, or allow the original user to delete
router.delete("/:id", validateId, deleteRequestAttachmentById);

export default router;
