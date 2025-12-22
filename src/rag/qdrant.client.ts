import { QdrantClient } from "@qdrant/js-client-rest";

export const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "rag_chunks";
export const QDRANT_DIM = Number(process.env.QDRANT_DIM || 1536);

let ensured: Promise<string> | null = null;

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

async function safeCreateIndex(
  name: string,
  field_name: string,
  field_schema: any
) {
  try {
    await qdrantClient.createPayloadIndex(name, { field_name, field_schema });
  } catch (e: any) {
    const msg = String(e?.message || e).toLowerCase();
    if (!msg.includes("exist")) throw e;
  }
}

async function ensurePayloadIndexes(name: string) {
  await safeCreateIndex(name, "documentId", "integer");
  await safeCreateIndex(name, "collectionId", "integer");
  await safeCreateIndex(name, "orgid", "keyword");
}

async function qdrantReady(name = "rag_chunks", dim = 1536): Promise<string> {
  const colData = await qdrantClient.getCollections();
  const exists = colData.collections?.some((c) => c.name === name);

  if (!exists) {
    await qdrantClient.createCollection(name, {
      vectors: { size: dim, distance: "Cosine" },
    });

    await ensurePayloadIndexes(name);
    return name;
  }

  const info: any = await qdrantClient.getCollection(name);
  const actual = info?.result?.config?.params?.vectors?.size;

  if (typeof actual === "number" && actual !== dim) {
    throw new Error(
      `Qdrant collection dim mismatch: expected ${dim}, got ${actual} (collection=${name})`
    );
  }

  await ensurePayloadIndexes(name);
  return name;
}

export async function ensureQdrant() {
  if (!ensured) {
    ensured = (async () => {
      if (!process.env.QDRANT_URL) throw new Error("QDRANT_URL missing");
      if (!process.env.QDRANT_API_KEY)
        throw new Error("QDRANT_API_KEY missing");
      return qdrantReady(QDRANT_COLLECTION, QDRANT_DIM);
    })();
  }
  return ensured;
}
