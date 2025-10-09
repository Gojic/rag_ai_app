import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
  const embedding = await openai.embeddings.create({
    model: model,
    input: texts,
  });

  return embedding.data.map((e) => e.embedding);
}

export async function embedQuery(query: string) {
  return (await embedTexts([query]))[0];
}
