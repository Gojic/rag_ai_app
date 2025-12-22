import { Router } from "express";
import { startIngest, ingestStatus } from "../controllers/ingest.controller";
import authenticate from "../middleware/is-auth";
import { ingestStartValidators } from "../validators/ingest.validators";
import { validate } from "../middleware/validators";
const router = Router();
/**
 * @openapi
 * /api/ingest/{documentId}:
 *   post:
 *     summary: Queue ingest job for a document (sets status to PENDING)
 *     tags:
 *       - Ingest
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Job queued
 *       400:
 *         description: DocId must be passed / invalid id
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */

router.post(
  "/:documentId",
  authenticate,
  ingestStartValidators,
  validate,
  startIngest
);

/**
 * @openapi
 * /api/ingest/{documentId}/status:
 *   get:
 *     summary: Get current ingest status for a document
 *     tags:
 *       - Ingest
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Returns document status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   example: "PENDING"
 *       400:
 *         description: DocId must be passed / invalid id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       422:
 *         description: Validation error
 */
router.get(
  "/:documentId/status",
  authenticate,
  ingestStartValidators,
  validate,
  ingestStatus
);
export default router;
