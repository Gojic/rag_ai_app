import { Request, Response } from "express";
import * as docs from "../services/document.service";
import db from "../db/models";
const { Document } = db as any;
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
export const startIngest = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.documentId);
  if (!id) {
    throw new AppError("DocId must be passed", 400, "NO_DOC_ID");
  }
  await Document.update({ status: "PENDING" }, { where: { id } });
  return res.json({ message: "Job queued", documentId: id });
});

export const ingestStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.documentId);
    if (!id) {
      throw new AppError("DocId must be passed", 400, "NO_DOC_ID");
    }

    const doc = await docs.getDocumentFromBase(id.toString());
    if (!doc) {
      throw new AppError("Document not found", 404, "NOT_FOUND");
    }
    return res.status(200).json({ id: doc.id, status: doc.status });
  }
);
