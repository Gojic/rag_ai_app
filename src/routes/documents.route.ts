import { Router } from "express";
import upload from "../middleware/upload";
import authenticate from "../middleware/is-auth";
import { validate } from "../middleware/validators";
import {
  uploadDocument,
  getDocumentDownloadUrl,
} from "../controllers/documents.controller";
import { uploadDocumentValidators } from "../validators/documents.validators";
const router = Router();
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadDocumentValidators,
  validate,
  uploadDocument
);
router.get("/:id/download-url", authenticate, getDocumentDownloadUrl);
export default router;
