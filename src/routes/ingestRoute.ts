import { Router } from "express";
import { startIngest, ingestStatus } from "../controllers/ingestController";
const router = Router();

router.post("/:documentId", startIngest);
router.get("/:documentId/status", ingestStatus);
export default router;
