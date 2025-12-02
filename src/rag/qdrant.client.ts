import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
});

export async function qdrantReady(
  name = "rag_chunks",
  dim = 1536
): Promise<string> {
  const colData = await qdrantClient.getCollections();
  const exists = colData.collections?.some((c) => c.name === name);

  if (!exists) {
    await qdrantClient.createCollection(name, {
      vectors: {
        size: dim, // size - Koliko elemenata ima svaki embedding vektor (npr. 1536 za OpenAI text-embedding-3-small)
        distance: "Cosine", // distance - Kojom metrikom se meri sličnost između vektora (najčešće "Cosine")
      },
    });
  }
  return name;
}
