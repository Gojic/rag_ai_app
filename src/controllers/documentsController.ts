import { Request, Response } from "express";
import * as docs from "../services/documentHandler";
import {
  getPresignedUrl,
  getObjectBuffer,
} from "../services/s3Download.service";
export const uploadDocument = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is missing" });
  }
  const collectionId = Number(req.body.collectionId);
  if (!collectionId) {
    return res.status(400).json({ message: "collectionId is required" });
  }
  const s3Key = (req.file as any).key;
  const s3Url = (req.file as any).location;
  try {
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
  } catch (e: any) {
    const msg =
      e.message === "Collection not found for this org" ||
      e.message === "collectionId is requred"
        ? 400
        : 500;

    return res.status(msg).json({ message: e.message || "Server error" });
  }
};

export const getDocumentDownloadUrl = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const doc = await docs.getDocumentFromBase(id);
    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }
    const { buffer, contentType } = await getObjectBuffer(doc.s3Key);
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.title ?? "document"}"`
    );
    return res.status(200).send(buffer);
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
};
