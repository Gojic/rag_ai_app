import { Request, Response } from "express";
import OpenAI from "openai";
import db from "../db/models";
import { qdrantClient } from "../rag/qdrant.client";
import { embedQuery } from "../rag/embedder";
import { buildPrompt } from "../rag/prompter";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ragQuery = asyncHandler(async (req: Request, res: Response) => {
  const { collectionId, question, topK = 6 } = req.body;
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
  const found = await qdrantClient.search("rag_chunks", {
    vector,
    limit: Number(topK),
    filter: {
      must: [
        { key: "orgid", match: { value: orgid } },
        { key: "collectionId", match: { value: collectionId } },
      ],
    },
  });
  const hits = found || [];

  const keys = hits.map((h) => h.payload?.chunkIndex as number);

  const chunks = await DocumentChunks.findAll({
    where: { documentId: docId, chunkIndex: keys },
    order: [["chunkIndex", "ASC"]],
  });
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

  return res.json({
    answer: completion.choices[0]?.message?.content ?? "",
    sources: hits.map((h, i) => ({
      documentId: h.payload?.documentId,
      chunkIndex: h.payload?.chunkIdex,
      score: h.score,
      ref: contexts[i]?.ref,
    })),
  });
});
