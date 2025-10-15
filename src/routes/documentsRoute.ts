import { Router } from "express";
import upload from "../middleware/upload";
import authenticate from "../middleware/is-auth";
import {
  uploadDocument,
  getDocumentDownloadUrl,
} from "../controllers/documentsController";
const router = Router();
router.post("/upload", upload.single("file"), authenticate, uploadDocument);
router.get("/:id/download-url", authenticate, getDocumentDownloadUrl);
export default router;
