import { Router } from "express";
import {
  createAccountUpdate,
  getMyLatestUpdate,
  listAccountUpdates,
  reviewAccountUpdate,
} from "../controllers/accountUpdates.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { handleUpload } from "../middleware/upload.js";

const router = Router();

router.post("/", requireAuth, handleUpload("proofFile"), createAccountUpdate);
router.get("/me", requireAuth, getMyLatestUpdate);
router.get("/", requireAuth, listAccountUpdates);
router.patch("/:id/review", requireAuth, reviewAccountUpdate);

export default router;
