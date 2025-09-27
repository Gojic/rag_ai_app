import { Request, Response } from "express";
import * as docs from "../services/uploadDocument";
export const uploadDocument = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is missing" });
  }
  // Za sada hard-code ili iz headera; req.user nema po difoltu
  const orgid = "ORG_DEMO";
  const s3Key = (req.file as any).key;
  const s3Url = (req.file as any).location;

  const doc = await docs.createFromUpload({
    orgid,
    collectionId: req.body.collectionId,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    s3Key,
    s3Url,
  });
  return res
    .status(201)
    .json({ message: "File uploaded successfully", document: doc });
};
