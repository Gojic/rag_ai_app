import db from "../db/models";
import { chunkerText } from "../rag/chunker";
import { parsePdfStream } from "../rag/parsers/pdfParser";
import { getObjectBuffer } from "./s3Download.service";

export async function ingestDocument(documentId: number) {
  const { Document, DocumentChunks, sequelize } = db as any;
  const doc = await Document.findByPk(documentId);

  if (!doc) {
    throw new Error("Document not found");
  }

  if (doc.size > 15 * 1024 * 1024) {
    throw new Error("PDF too large to process (max 15MB)");
  }
  const { buffer } = await getObjectBuffer(doc.s3Key);

  let pieces: { index: number; text: string }[] = [];

  if (doc.mimeType === "application/pdf") {
    pieces = await parsePdfStream(buffer);
  } else if (doc.mimeType?.startsWith("text/")) {
    const text = buffer.toString("utf8");
    pieces = chunkerText(text);
  } else {
    throw new Error(`Unsupported mimeType: ${doc.mimeType}`);
  }
  if (!pieces.length) {
    throw new Error("Empty content after parse");
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
