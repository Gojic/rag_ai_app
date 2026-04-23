import { RequestHandler, Router } from "express";
import upload from "../middleware/upload";

import { validate } from "../middleware/validators";
import { createDocumentController } from "../controllers/documents.controller";
import { uploadDocumentValidators } from "../validators/documents.validators";

export const createDocumentRouter = (
  controller: ReturnType<typeof createDocumentController>,
  authMiddleware: RequestHandler,
) => {
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
    authMiddleware,
    upload.single("file"),
    uploadDocumentValidators,
    validate,
    controller.uploadDocument,
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
  router.get(
    "/:id/download-url",
    authMiddleware,
    controller.getDocumentDownloadUrl,
  );

  /**
   * @openapi
   * /api/documents/{id}:
   *   get:
   *     summary: Get all documents from a specific collection
   *     tags:
   *       - Documents
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the collection
   *         schema:
   *           type: string
   *           example: "2"
   *     responses:
   *       200:
   *         description: Returns an array of documents in the collection
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "File uploaded successfully"
   *                 documents:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       title:
   *                         type: string
   *                         example: "US - Računovodstvo"
   *                       content:
   *                         type: string
   *                         example: "Opis dokumenta"
   *                       orgid:
   *                         type: integer
   *                         example: 5
   *                       mimeType:
   *                         type: string
   *                         example: "application/pdf"
   *                       size:
   *                         type: integer
   *                         example: 1024
   *                       status:
   *                         type: string
   *                         example: "PENDING"
   *                       s3Key:
   *                         type: string
   *                         example: "uploads/abc123.pdf"
   *                       s3Url:
   *                         type: string
   *                         nullable: true
   *                         example: "https://s3.amazonaws.com/bucket/uploads/abc123.pdf"
   *       400:
   *         description: Invalid collection ID
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Collection not found or no documents in collection
   */
  router.get("/:id", authMiddleware, controller.getDocumentsByCollection);
  return router;
};
