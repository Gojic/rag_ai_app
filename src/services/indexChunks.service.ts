import db from "../db/models";
import { qdrantClient, qdrantReady } from "../rag/qdrant.client";
import { embedTexts } from "../rag/embedder";
import { AppError } from "../utils/AppError";
import {
  DocumentEntity,
  DocumentChunkEntity,
  QdrantPoint,
} from "../domain/ingest.types";
function makePointId(documentId: number, chunkIndex: number) {
  return documentId * 1_000_000 + chunkIndex; // number
}
export async function indexDocumentChunks(documentId: number): Promise<number> {
  const { Document, DocumentChunks } = db as any;
  const doc = (await Document.findByPk(documentId)) as DocumentEntity | null;
  if (!doc) {
    throw new AppError("Document not found", 404, "NOT_FOUND");
  }
  const chunks = (await DocumentChunks.findAll({
    where: { documentId },
    order: [["chunkIndex", "ASC"]],
  })) as DocumentChunkEntity[];
  if (!chunks.length) {
    return 0;
  }
  const collection = await qdrantReady();
  const embeddings = await embedTexts(chunks.map((c) => c.text));
  const points: QdrantPoint[] = chunks.map((c, idx) => ({
    id: makePointId(documentId, c.chunkIndex),
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
