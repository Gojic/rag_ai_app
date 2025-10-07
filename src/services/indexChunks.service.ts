import db from "../db/models";
import { qdrantReady } from "../rag/qdrant.client";

export async function indexDocumentChunks(documentId: number): Promise<void> {
  const { Document, DocumentChunks } = db as any;
  const doc = await Document.findByPk(documentId);
  if (!doc) {
    throw new Error("Document not found");
  }
  console.log("servisi");
  await qdrantReady();
}
