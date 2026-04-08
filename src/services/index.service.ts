import { AppError } from "../utils/AppError";
import { IIndexRepository } from "../repository/index.repository";
import { qdrantClient, ensureQdrant } from "../rag/qdrant.client";
import { embedTexts } from "../rag/embedder";
import { QdrantPoint } from "../domain/ingest.types";

export interface IIndexService {
  indexDocumentChunks(documentId: number): Promise<number>;
}

function makePointId(documentId: number, chunkIndex: number) {
  return documentId * 1_000_000 + chunkIndex;
}

export const createIndexService = (
  indexRepo: IIndexRepository,
): IIndexService => {
  return {
    async indexDocumentChunks(documentId: number): Promise<number> {
      const doc = await indexRepo.findDocumentById(documentId);
      if (!doc) {
        throw new AppError("Document not found", 404, "NOT_FOUND");
      }
      if (!doc.orgid || !doc.collectionId) {
        throw new Error("Missing orgid or collectionId for indexing");
      }
      const chunks = await indexRepo.findChunksByDocumentId(documentId);
      if (!chunks.length) {
        return 0;
      }

      const collection = await ensureQdrant();
      const embeddings = await embedTexts(chunks.map((c) => c.text));

      const points: QdrantPoint[] = chunks.map((c, idx) => ({
        id: makePointId(documentId, c.chunkIndex),
        vector: embeddings[idx],
        payload: {
          orgid: String(doc.orgid).trim(),
          collectionId: parseInt(String(doc.collectionId), 10),
          documentId: parseInt(String(doc.id), 10),
          chunkIndex: parseInt(String(c.chunkIndex), 10),
        },
      }));

      await qdrantClient.upsert(collection, { wait: true, points });

      return points.length;
    },
  };
};
