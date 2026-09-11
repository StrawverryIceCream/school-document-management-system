import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createDocument,
  getAllDocument,
  getDocumentById,
  updateDocumentType,
} from "../controllers/documents.controller.js";
import { requireRoles } from "../middleware/requireRoles.js";
const router = Router();

router.use(requireAuth);
router.get("/", requireRoles("admin", "staff"), getAllDocument);
router.get("/:id", requireRoles("admin", "staff"), getDocumentById);
router.post("/", requireRoles("admin"), createDocument);
router.patch("/", requireRoles("admin"), updateDocumentType);
export default router;
