import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

type PdfTextItem = {
  str: string;
};
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = false;

type Chunk = { index: number; text: string };

export async function parsePdfStream(
  buffer: Buffer,
  chunkSize = Number(process.env.CHUNK_SIZE ?? 900),
  overlap = Number(process.env.CHUNK_OVERLAP ?? 150)
): Promise<Chunk[]> {
  const uint8 = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8,
    isEvalSupported: false,
    useWorkerFetch: false,
    stopAtErrors: true,
    useSystemFonts: false,
  });

  const pdfDocument = await loadingTask.promise;
  const chunks: Chunk[] = [];
  let carry = "";
  let idx = 0;

  try {
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items as PdfTextItem[])
        .map((it: any) => it.str)
        .join(" ");

      carry = (carry + " " + pageText).trim();

      // Emituj chunkove dok ima dovoljno materijala
      while (carry.length >= chunkSize) {
        const slice = carry.slice(0, chunkSize);
        chunks.push({ index: idx++, text: slice });
        // pomeri prozor uz overlap
        carry = carry.slice(chunkSize - overlap);
      }

      await page.cleanup();
    }

    // Na kraju – emituj eventualni ostatak (ako ima smisla)
    if (carry.trim().length) {
      chunks.push({ index: idx++, text: carry.trim() });
    }

    return chunks;
  } finally {
    await pdfDocument.cleanup?.();
    await pdfDocument.destroy?.();
  }
}
