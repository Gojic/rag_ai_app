import { Router } from "express";
import { startIngest, ingestStatus } from "../controllers/ingestController";
import authenticate from "../middleware/is-auth";
const router = Router();

router.post("/:documentId", authenticate, startIngest);
router.get("/:documentId/status", authenticate, ingestStatus);
export default router;
