import { Router } from "express";
import authenticate from "../middleware/is-auth";
import { validate } from "../middleware/validators";
import { ragQueryValidators } from "../validators/rag.validators";
import { createRAGController } from "../controllers/rag.controller";

export const createRAGRouter = (
  controller: ReturnType<typeof createRAGController>,
) => {
  const router = Router();
  /**
   * @openapi
   * /api/rag/query:
   *   post:
   *     summary: Ask a question over ingested document chunks (RAG)
   *     tags:
   *       - RAG
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - collectionId
   *               - docId
   *               - question
   *             properties:
   *               collectionId:
   *                 type: integer
   *                 example: 1
   *               docId:
   *                 type: integer
   *                 example: 12
   *               question:
   *                 type: string
   *                 example: "Koje su glavne obaveze ugovornih strana?"
   *               topK:
   *                 type: integer
   *                 description: "How many chunks to retrieve from Qdrant (default: 6)"
   *                 example: 6
   *     responses:
   *       200:
   *         description: Answer + sources
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 answer:
   *                   type: string
   *                   example: "Glavne obaveze su..."
   *                 sources:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       documentId:
   *                         type: integer
   *                         example: 12
   *                       chunkIndex:
   *                         type: integer
   *                         example: 3
   *                       score:
   *                         type: number
   *                         example: 0.8123
   *                       ref:
   *                         type: string
   *                         example: "doc:12 chunk:3"
   *       400:
   *         description: Missing collectionId or docId
   *       401:
   *         description: Unauthorized (missing/invalid JWT or org)
   *       422:
   *         description: Validation error
   */
  router.post(
    "/query",
    authenticate,
    ragQueryValidators,
    validate,
    controller.query,
  );
  return router;
};
