import { IWorkerRepository } from "../repository/worker.repository";
import { IIngestService } from "../services/ingest.service";

export interface IIndexService {
  indexDocumentChunks(documentId: number): Promise<number>;
}

export const createWorkerEngine = (
  workerRepo: IWorkerRepository,
  ingestService: IIngestService,
  indexService: IIndexService,
) => {
  const processDocument = async (documentId: number): Promise<void> => {
    console.log(`[WORKER] Processing document ${documentId}...`);
    try {
      console.log("INGEST START");
      const ingestResult = await ingestService.ingestDocument(documentId);
      console.log(`[WORKER] Ingest OK. chunks=${ingestResult.chunks}`);

      const indexed = await indexService.indexDocumentChunks(documentId);
      console.log(`[WORKER] Indexed into Qdrant: ${indexed} chunks`);
    } catch (err: any) {
      console.error(
        `[WORKER] Failed processing ${documentId}:`,
        err?.message || err,
      );
      await workerRepo.updateStatus(documentId, "FAILED");
    }
  };

  const poll = async (): Promise<void> => {
    const id = await workerRepo.findNextPending();
    if (id) {
      const claimed = await workerRepo.claimDocument(id);
      if (claimed) {
        await processDocument(id);
      }
    } else {
      console.log("[WORKER] No pending docs.");
    }
  };

  return { poll, processDocument };
};
