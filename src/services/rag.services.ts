import OpenAI from "openai";
import { IRAGRepository } from "../repository/rag.repository";
import { qdrantClient, ensureQdrant } from "../rag/qdrant.client";
import { embedQuery } from "../rag/embedder";
import { buildPrompt } from "../rag/prompter";
import {
  RAGQueryInputDTO,
  RAGSourceDTO,
  QdrantSearchHit,
} from "../domain/ingest.types";

export interface IRAGService {
  query(
    input: RAGQueryInputDTO,
    orgid: string,
  ): Promise<{ answer: string; sources: RAGSourceDTO[] }>;
}

export const createRAGService = (ragRepo: IRAGRepository): IRAGService => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  return {
    async query(input, orgid) {
      const { collectionId, docId, question, topK = 6 } = input;
      const vector = await embedQuery(question);
      const collectionName = await ensureQdrant();
      console.log("Filter values:", {
        docId: Number(docId),
        collectionId: Number(collectionId),
        orgid: String(orgid),
      });
      const raw = await qdrantClient.search(collectionName, {
        vector,
        limit: Number(topK),
        filter: {
          must: [
            { key: "documentId", match: { value: Number(docId) } },
            { key: "collectionId", match: { value: Number(collectionId) } },
            { key: "orgid", match: { value: String(orgid) } },
          ],
        },
      });

      const hits: QdrantSearchHit[] = raw.map((h) => ({
        id: h.id as number,
        score: h.score,
        payload: h.payload as any,
      }));

      if (!hits.length) {
        return {
          answer: "Nisam pronašao relevantne delove u dokumentu.",
          sources: [],
        };
      }

      const chunkIndexes = hits.map((h) => h.payload.chunkIndex);
      const chunks = await ragRepo.findChunksByIndexes(docId, chunkIndexes);

      const contexts = chunks.map((c) => ({
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

      return { answer, sources };
    },
  };
};
