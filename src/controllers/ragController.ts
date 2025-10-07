import { Request, Response } from "express";
import * as qdrant from "../services/indexChunks.service";
export const ragQuery = async (req: Request, res: Response) => {
  console.log(req.body.docId);
  const docId = Number(req.body.docId);
  console.log("controller");
  if (!docId) {
    return res.status(400).json({ message: "collectionId is required" });
  }
  return await qdrant.indexDocumentChunks(docId);
};
