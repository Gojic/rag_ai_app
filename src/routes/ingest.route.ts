import { Router } from "express";
import { startIngest, ingestStatus } from "../controllers/ingest.controller";
import authenticate from "../middleware/is-auth";
import { ingestStartValidators } from "../validators/ingest.validators";
import { validate } from "../middleware/validators";
const router = Router();

router.post(
  "/:documentId",
  authenticate,
  ingestStartValidators,
  validate,
  startIngest
);
router.get(
  "/:documentId/status",
  authenticate,
  ingestStartValidators,
  validate,
  ingestStatus
);
export default router;
