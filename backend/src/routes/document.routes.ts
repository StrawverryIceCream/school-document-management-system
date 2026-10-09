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

router.use(requireAuth);
router.get("/", getAllDocument);
router.get("/:id", validateId, getDocumentById);
router.post("/", requireRoles("admin"), createDocument);
router.patch("/:id", requireRoles("admin"), validateId, updateDocumentType);
router.delete("/:id", requireRoles("admin"), validateId, deleteDocumentById);
export default router;
