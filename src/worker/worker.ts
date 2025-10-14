import "dotenv/config";
import db from "../db/models";
import { ingestDocument } from "../services/ingest.service";
import { indexDocumentChunks } from "../services/indexChunks.service";

const { Document, sequelize } = db as any;
const POLL_MS = Number(process.env.WORKER_POLL_MS || 5000);
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
async function processDocument(documentId: number): Promise<void> {
  console.log(`[WORKER] Processing document ${documentId}…`);

  try {
    const ingestResult = await ingestDocument(documentId);
    console.log(`[WORKER] Ingest OK. chunks=${ingestResult.chunks}`);

    const indexed = await indexDocumentChunks(documentId);
    console.log(`[WORKER] Indexed into Qdrant: ${indexed} chunks`);
  } catch (err: any) {
    console.error(
      `[WORKER] Failed processing ${documentId}:`,
      err?.message || err
    );
    await Document.update({ status: "FAILED" }, { where: { id: documentId } });
  }
}

async function claimNextPending(): Promise<number | null> {
  const next = await Document.findOne({
    where: { status: "PENDING" },
    order: [["createdAt", "ASC"]],
    attributes: ["id"],
  });
  if (!next) {
    return null;
  }
  const [affected] = await Document.update(
    { status: "RUNNING" },
    { where: { id: next.id, status: "PENDING" } }
  );

  return affected === 1 ? (next.id as number) : null;
}

async function pollLoop(): Promise<void> {
  console.log(`[WORKER] Polling every ${POLL_MS}ms`);
  while (true) {
    try {
      const id = await claimNextPending();
      if (id) {
        try {
          await processDocument(id);
        } catch (err: any) {
          console.error(
            `[WORKER] Failed processing ${id}:`,
            err?.message || err
          );
        }
      } else {
        console.log("[WORKER] No pending docs.");
        await sleep(POLL_MS);
      }
    } catch (err: any) {
      console.error("[WORKER] Poll error:", err?.message || err);
      await sleep(POLL_MS);
    }
  }
}

// entrypoint
(async () => {
  try {
    await sequelize.authenticate();
    console.log("[WORKER] DB connected.");

    const argv = process.argv.slice(2);
    const docIdx = argv.findIndex((a) => a === "--doc");
    if (docIdx >= 0 && argv[docIdx + 1]) {
      // Single-shot mod
      const id = Number(argv[docIdx + 1]);
      if (!id) {
        console.error("Usage: ts-node src/worker/worker.ts --doc <id>");
        process.exit(1);
      }
      try {
        // preuzmi dokument u RUNNING, osim ako ga već nisi preuzeo ručno
        await Document.update(
          { status: "RUNNING" },
          { where: { id, status: "PENDING" } }
        );
        // ako nije bio PENDING, a želiš forsirati obradu, skloni uslov iz where
        await processDocument(id);
        process.exit(0);
      } catch (err: any) {
        console.error("[WORKER] Single-shot failed:", err?.message || err);
        process.exit(1);
      }
    } else {
      // Polling mod
      await pollLoop();
    }
  } catch (e: any) {
    console.error("[WORKER] Fatal error:", e?.message || e);
    process.exit(1);
  }
})();
