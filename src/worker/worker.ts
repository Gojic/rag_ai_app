import "dotenv/config";
import models from "../db/models";
import { DB } from "../db/db.types";
import { initContainer } from "../container";
import { createWorkerRepository } from "../repository/worker.repository";
import { createWorkerEngine } from "./worker.engine";

const db = models as unknown as DB;
const POLL_MS = Number(process.env.WORKER_POLL_MS || 5000);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL: JWT_SECRET is not defined in .env file!");
  process.exit(1);
}
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("[WORKER] DB connected.");

    const container = initContainer(db, jwtSecret);

    const workerRepo = createWorkerRepository(db.Document);

    const engine = createWorkerEngine(
      workerRepo,
      container.ingestService,
      container.indexService,
    );

    console.log(`[WORKER] Polling every ${POLL_MS}ms`);
    while (true) {
      try {
        await engine.poll();
      } catch (err: any) {
        console.error("[WORKER] Poll error:", err?.message || err);
      }
      await new Promise((res) => setTimeout(res, POLL_MS));
    }
  } catch (e: any) {
    console.error("[WORKER] Fatal error:", e?.message || e);
    process.exit(1);
  }
})();
