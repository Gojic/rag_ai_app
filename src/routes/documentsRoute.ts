import { Router } from "express";
import upload from "../middleware/upload";
import { uploadDocument } from "../controllers/documentsController";
const router = Router();
router.post("/upload", upload.single("file"), uploadDocument);
export default router;
