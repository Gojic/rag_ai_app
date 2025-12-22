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
/**
 * @openapi
 * /api/documents/upload:
 *   post:
 *     summary: Upload a document to a collection (S3) and create DB record
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - collectionId
 *               - title
 *               - content
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               collectionId:
 *                 type: integer
 *                 example: 2
 *               title:
 *                 type: string
 *                 example: "US - Računovodstvo"
 *               content:
 *                 type: string
 *                 example: "Opis dokumenta"
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: File missing / invalid collectionId / collection not found
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadDocumentValidators,
  validate,
  uploadDocument
);
/**
 * @openapi
 * /api/documents/{id}/download-url:
 *   get:
 *     summary: Download a document by id (returns file buffer)
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: Returns the document binary (attachment)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.get("/:id/download-url", authenticate, getDocumentDownloadUrl);
export default router;
