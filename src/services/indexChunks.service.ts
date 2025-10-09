import db from "../db/models";
import { qdrantClient, qdrantReady } from "../rag/qdrant.client";
import { embedTexts } from "../rag/embedder";
export async function indexDocumentChunks(documentId: number): Promise<number> {
  const { Document, DocumentChunks } = db as any;
  const doc = await Document.findByPk(documentId);
  if (!doc) {
    throw new Error("Document not found");
  }
  const chunks = await DocumentChunks.findAll({
    where: { documentId },
    order: [["chunkIndex", "ASC"]],
  });
  if (!chunks.length) {
    return 0;
  }
  const collection = await qdrantReady();
  const embeddings = await embedTexts(chunks.map((c: any) => c.text));
  const points = chunks.map((c: any, idx: number) => ({
    id: `${documentId}_${c.chunkIndex}`,
    vector: embeddings[idx],
    payload: {
      orgid: doc.orgid,
      collectionId: doc.collectionId,
      documentId: doc.id,
      chunkIndex: c.chunkIndex,
    },
  }));
  await qdrantClient.upsert(collection, { wait: true, points });
  return points.length;
}
