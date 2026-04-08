import { Chunk } from "../domain/ingest.types";
export function chunkerText(
  input: string,
  chunkSize = Number(process.env.CHUNK_SIZE ?? 900),
  overlap = Number(process.env.CHUNK_OVERLAP ?? 150),
): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  let idx = 0;

  while (i < input.length) {
    const end = Math.min(i + chunkSize, input.length);
    const slice = input.slice(i, end).trim();
    if (slice) {
      chunks.push({ index: idx++, text: slice });
    }
    /* i = end - overlap;
    if (i < 0) {
      i = 0;
    }*/
    i = Math.max(i + chunkSize - overlap, i + 1);
  }
  return chunks;
}
