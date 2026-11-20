import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createDocument,
  deleteDocumentById,
  getAllDocument,
  getDocumentById,
  getOfficeScopedDocuments,
  updateDocumentType,
} from "../controllers/documents.controller.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
const router = Router();

// Read routes (Public for landing page credentials catalog; /scoped requires staff/admin)
router.get("/", getAllDocument);
router.get(
  "/scoped",
  requireAuth,
  requireRoles("admin", "staff"),
  getOfficeScopedDocuments,
);
router.get("/:id", validateId, getDocumentById);

// Write routes (Admin only for create/delete; office-scoped staff & admin for updates)
router.use(requireAuth);
router.post("/", requireRoles("admin"), createDocument);
router.patch("/:id", requireRoles("admin", "staff"), validateId, updateDocumentType);
router.delete("/:id", requireRoles("admin"), validateId, deleteDocumentById);
export default router;
