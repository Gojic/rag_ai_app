import { Request, Response } from "express";
import OpenAI from "openai";
import db from "../db/models";
import { qdrantClient } from "../rag/qdrant.client";
import { embedQuery } from "../rag/embedder";
import { buildPrompt } from "../rag/prompter";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

import {
  DocumentChunkEntity,
  QdrantSearchHit,
  RAGQueryInputDTO,
  RAGSourceDTO,
} from "../domain/ingest.types";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ragQuery = asyncHandler(async (req: Request, res: Response) => {
  const { collectionId, question, topK = 6 } = req.body as RAGQueryInputDTO;
  const docId = Number(req.body.docId);
  const { DocumentChunks } = db as any;

  if (!collectionId)
    throw new AppError(
      "CollectionId must be passed",
      400,
      "COLLECTIONID_REQUIRED"
    );
  if (!docId) throw new AppError("DocId must be passed", 400, "DOCID_REQUIRED");
  const orgid = (req as any).orgid;
  if (!orgid) throw new AppError("Unauthorized", 401, "NO_ORG");
  const vector = await embedQuery(question);
  const raw = await qdrantClient.search("rag_chunks", {
    vector,
    limit: Number(topK || 6),
    filter: {
      must: [
        { key: "orgid", match: { value: orgid } },
        { key: "collectionId", match: { value: collectionId } },
      ],
    },
  });

  const hits: QdrantSearchHit[] = (raw || []).map((h) => ({
    id: h.id,
    score: h.score,
    payload: {
      orgid: (h.payload as any)?.orgid as string,
      collectionId: (h.payload as any)?.collectionId as number | null,
      documentId: (h.payload as any)?.documentId as number,
      chunkIndex: (h.payload as any)?.chunkIndex as number,
    },
  }));
  if (!hits.length) {
    return res.status(200).json({
      answer: "Not found relevant parts in documents for this question.",
      sources: [] as RAGSourceDTO[],
    });
  }
  //const keys = hits.map((h) => h.payload?.chunkIndex as number);
  const chunkIndexes = hits.map((h) => h.payload.chunkIndex);
  const chunks = (await DocumentChunks.findAll({
    where: { documentId: docId, chunkIndex: chunkIndexes },
    order: [["chunkIndex", "ASC"]],
  })) as DocumentChunkEntity[];

  const contexts = chunks.map((c: any) => ({
    text: c.text.slice(0, 1200),
    ref: `doc:${c.documentId} chunk:${c.chunkIndex}`,
  }));

  const prompt = buildPrompt(question, contexts);
  const completion = await openai.chat.completions.create({
    model: process.env.CHAT_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const answer = completion.choices[0]?.message?.content ?? "";
  const sources: RAGSourceDTO[] = hits.map((h) => ({
    documentId: h.payload.documentId,
    chunkIndex: h.payload.chunkIndex,
    score: h.score,
    ref: `doc:${h.payload.documentId} chunk:${h.payload.chunkIndex}`,
  }));
  return res.json({
    answer,
    sources,
  });
});
