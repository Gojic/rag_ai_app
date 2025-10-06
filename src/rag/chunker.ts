//SIMPLE CHUNKER FOR NOW

export function chunkerText(
  input: string,
  chunkSize = Number(process.env.CHUNK_SIZE ?? 900),
  overlap = Number(process.env.CHUNK_OVERLAP ?? 150)
) {
  const chunks: { index: number; text: string }[] = [];
  let i = 0;
  let idx = 0;

  while (i < input.length) {
    const end = Math.min(i + chunkSize, input.length);
    const slice = input.slice(i, end).trim();
    if (slice) {
      chunks.push({ index: idx++, text: slice });
    }
    i = end - overlap;
    if (i < 0) {
      i = 0;
    }
  }
  return chunks;
}
