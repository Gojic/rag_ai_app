import { Request, Response } from "express";
import * as docs from "../services/documentHandler";
import { getObjectBuffer } from "../services/s3Download.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
export const uploadDocument = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("File is missing", 400, "NO_FILE");
    }
    const collectionId = Number(req.body.collectionId);

    const s3Key = (req.file as any).key;
    const s3Url = (req.file as any).location;

    const doc = await docs.createFromUpload({
      orgid: (req as any).orgid,
      collectionId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      s3Key,
      s3Url,
    });
    return res
      .status(201)
      .json({ message: "File uploaded successfully", document: doc });
  }
);

export const getDocumentDownloadUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const doc = await docs.getDocumentFromBase(id);
    if (!doc) {
      throw new AppError("Document not found", 404, "NOT_FOUND");
    }
    const { buffer, contentType } = await getObjectBuffer(doc.s3Key);
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.title ?? "document"}"`
    );
    return res.status(200).send(buffer);
  }
);
