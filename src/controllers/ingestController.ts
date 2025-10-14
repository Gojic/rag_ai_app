import { Request, Response } from "express";
import * as docs from "../services/documentHandler";
import db from "../db/models";
const { Document } = db as any;
export const startIngest = async (req: Request, res: Response) => {
  const id = Number(req.params.documentId);
  await Document.update({ status: "PENDING" }, { where: { id } });
  return res.json({ message: "Job queued", documentId: id });
  /* try {
    console.log("id:", id);
    const result = await ingestDocument(id);
    return res.json({ message: "Ingest started and completed", ...result });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Ingest failed", error: err.message });
  } */
};

export const ingestStatus = async (req: Request, res: Response) => {
  const id = Number(req.params.documentId);

  try {
    console.log(id);
    const doc = await docs.getDocumentFromBase(id.toString());
    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.status(200).json({ id: doc.id, status: doc.status });
  } catch (error) {}
};
