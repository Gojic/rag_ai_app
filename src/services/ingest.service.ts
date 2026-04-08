import { AppError } from "../utils/AppError";
import { IIngestRepository } from "../repository/ingest.repository";
import { IngestResult, Chunk, IngestStatusDTO } from "../domain/ingest.types";
import { getObjectBuffer } from "./s3Download.service";
import { parsePdfStream } from "../rag/parsers/pdfParser";
import { chunkerText } from "../rag/chunker";

export interface IIngestService {
  ingestDocument(documentId: number): Promise<IngestResult>;
  prepareForIngest(documentId: number): Promise<void>;
  getIngestStatus(documentId: number): Promise<IngestStatusDTO>;
}

export const createIngestService = (
  ingestRepo: IIngestRepository,
): IIngestService => {
  return {
    async ingestDocument(documentId: number): Promise<IngestResult> {
      const doc = await ingestRepo.findById(documentId);
      if (!doc) {
        throw new AppError("Document not found", 404, "NOT_FOUND");
      }

      if (doc.size && doc.size > 15 * 1024 * 1024) {
        throw new AppError("PDF too large (max 15MB)", 400, "FILE_TOO_BIG");
      }

      const { buffer } = await getObjectBuffer(doc.s3Key);

      let pieces: Chunk[] = [];
      if (doc.mimeType === "application/pdf") {
        pieces = await parsePdfStream(buffer);
      } else if (doc.mimeType?.startsWith("text/")) {
        const text = buffer.toString("utf8");
        pieces = chunkerText(text);
      } else {
        throw new AppError(
          `Unsupported mimeType: ${doc.mimeType}`,
          400,
          "FILE_UNSUPPORTED",
        );
      }

      if (!pieces.length) {
        throw new AppError(
          "Empty content after parse",
          400,
          "FILE_UNSUPPORTED",
        );
      }

      await ingestRepo.transaction(async (t) => {
        await ingestRepo.deleteChunks(documentId, t);

        const chunksToCreate = pieces.map((p) => ({
          documentId,
          chunkIndex: p.index,
          text: p.text,
        }));

        await ingestRepo.bulkCreateChunks(chunksToCreate, t);

        const preview = pieces
          .slice(0, 3)
          .map((p) => p.text)
          .join(" ")
          .slice(0, 2000);

        await doc.update(
          { status: "DONE", content: preview },
          { transaction: t },
        );
      });

      return { ok: true, chunks: pieces.length };
    },

    async prepareForIngest(documentId: number): Promise<void> {
      const doc = await ingestRepo.findById(documentId);
      if (!doc) {
        throw new AppError("Document not found", 404, "NOT_FOUND");
      }

      await ingestRepo.updateStatus(documentId, "PENDING");
    },

    async getIngestStatus(documentId: number): Promise<IngestStatusDTO> {
      const doc = await ingestRepo.findById(documentId);
      if (!doc) {
        throw new AppError("Document not found", 404, "NOT_FOUND");
      }

      return {
        id: doc.id,
        status: doc.status,
      };
    },
  };
};
