import multer from "multer";
import { type Request, type Response, type NextFunction } from "express";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ATTACHMENT_MIME_TYPES = [...ALLOWED_MIME_TYPES, "application/pdf"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or WebP images are allowed"));
    }
    cb(null, true);
  },
});

const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PDF, JPG, PNG, or WebP files are allowed"));
    }
    cb(null, true);
  },
});

// Wrapped so multer errors return JSON 400 instead of Express's default 500 HTML page
export function handleUpload(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  };
}

export function handleMultipleAttachments(fieldName = "files", maxCount = 10) {
  return (req: Request, res: Response, next: NextFunction) => {
    attachmentUpload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  };
}