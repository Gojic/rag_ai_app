import { Request, Response } from "express";
import { IDocumentService } from "../services/document.service";
import { getObjectBuffer } from "../services/s3Download.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const createDocumentController = (docService: IDocumentService) => {
  return {
    uploadDocument: asyncHandler(async (req: Request, res: Response) => {
      if (!req.file) {
        throw new AppError("File is missing", 400, "NO_FILE");
      }

      const collectionId = Number(req.body.collectionId);
      if (isNaN(collectionId)) {
        throw new AppError(
          "Invalid collectionId",
          400,
          "INVALID_COLLECTION_ID",
        );
      }

      const file = req.file as any;
      const s3Key = file.key;
      const s3Url = file.location;

      const orgid = (req as any).orgid;
      if (!orgid) throw new AppError("Unauthorized", 401, "NO_ORG");

      const doc = await docService.createFromUpload({
        orgid,
        collectionId,
        title: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        s3Key,
        s3Url,
      });

      return res
        .status(201)
        .json({ message: "File uploaded successfully", document: doc });
    }),

    getDocumentDownloadUrl: asyncHandler(
      async (req: Request, res: Response) => {
        const { id } = req.params;

        const doc = await docService.getDocumentFromBase(id);
        if (!doc) {
          throw new AppError("Document not found", 404, "NOT_FOUND");
        }

        // S3 Download logika
        const { buffer, contentType } = await getObjectBuffer(doc.s3Key);

        res.setHeader("Content-Type", contentType);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${doc.title ?? "document"}"`,
        );

        return res.status(200).send(buffer);
      },
    ),

    getDocumentsByCollection: asyncHandler(
      async (req: Request, res: Response) => {
        const { id } = req.params;

        const documents = await docService.getDocumentsFromCollection(id);

        return res.status(200).json({
          message: "Documents retrieved successfully",
          documents,
        });
      },
    ),
  };
};
