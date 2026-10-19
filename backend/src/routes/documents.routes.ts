import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createDocument,
  deleteDocumentById,
  getAllDocument,
  getDocumentById,
  updateDocumentType,
} from "../controllers/documents.controller.js";
import { requireRoles } from "../middleware/requireRoles.js";
import validateId from "../middleware/validateId.js";
const router = Router();

// Read routes (Public for landing page credentials catalog)
router.get("/", getAllDocument);
router.get("/:id", validateId, getDocumentById);

// Write routes (Admin only)
router.use(requireAuth);
router.post("/", requireRoles("admin"), createDocument);
router.patch("/:id", requireRoles("admin"), validateId, updateDocumentType);
router.delete("/:id", requireRoles("admin"), validateId, deleteDocumentById);
export default router;
