import db from "../db/models";
import { chunkerText } from "../rag/chunker";
import { parsePdfStream } from "../rag/parsers/pdfParser";
import { getObjectBuffer } from "./s3Download.service";
import { AppError } from "../utils/AppError";
import { IngestResult, DocumentInstance } from "../domain/ingest.types";
export async function ingestDocument(
  documentId: number
): Promise<IngestResult> {
  const { Document, DocumentChunks, sequelize } = db as any;
  const doc = (await Document.findByPk(documentId)) as DocumentInstance | null;

  if (!doc) {
    throw new AppError("Document not found", 404, "NOT_FOUND");
  }

  if (doc.size && doc.size > 15 * 1024 * 1024) {
    throw new AppError(
      "PDF too large to process (max 15MB)",
      401,
      "FILE_TOO_BIG"
    );
  }
  const { buffer } = await getObjectBuffer(doc.s3Key);

  let pieces: { index: number; text: string }[] = [];

  if (doc.mimeType === "application/pdf") {
    pieces = await parsePdfStream(buffer);
  } else if (doc.mimeType?.startsWith("text/")) {
    const text = buffer.toString("utf8");
    pieces = chunkerText(text);
  } else {
    throw new AppError(
      `Unsupported mimeType: ${doc.mimeType}`,
      401,
      "FILE_UNSUPPORTED"
    );
  }
  if (!pieces.length) {
    throw new AppError("Empty content after parse", 401, "FILE_UNSUPPORTED");
  }
  //  const pieces = chunkerText(text);

  await sequelize.transaction(async (t: any) => {
    await DocumentChunks.destroy({ where: { documentId }, transaction: t });
    await DocumentChunks.bulkCreate(
      pieces.map((p) => ({
        documentId,
        chunkIndex: p.index,
        text: p.text,
      })),
      { transaction: t }
    );

    const preview = pieces
      .slice(0, 3)
      .map((p) => p.text)
      .join(" ")
      .slice(0, 2000);
    await doc.update(
      {
        status: "DONE",
        content: preview,
      },
      { transaction: t }
    );
  });

  return { ok: true, chunks: pieces.length };
}
