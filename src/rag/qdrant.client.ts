import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ url: process.env.QDRANT_URL });

console.log("[QDRANT_URL at boot]", process.env.QDRANT_URL);
export async function qdrantReady(): Promise<boolean> {
  const getCol = await client.getCollections();
  console.log("dohvati qdrant kolekciju", getCol);
  return true;
}
