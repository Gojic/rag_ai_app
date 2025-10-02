import { Router } from "express";
import upload from "../middleware/upload";
import {
  uploadDocument,
  getDocumentDownloadUrl,
} from "../controllers/documentsController";
const router = Router();
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/:id/download-url", getDocumentDownloadUrl);
export default router;
