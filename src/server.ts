import "dotenv/config";
import { createApp } from "./app";
import db from "./db/db";
import { DB } from "./db/db.types";
import { ensureQdrant } from "./rag/qdrant.client";
import { initContainer } from "./container";

const typedDb = db as unknown as DB;
const sequelize = typedDb.sequelize;
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL: JWT_SECRET is not defined in .env file!");
  process.exit(1);
}
export const container = initContainer(db as unknown as DB, jwtSecret);

const app = createApp(container);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    try {
      await ensureQdrant();
      console.log("Qdrant ready");
    } catch (e: any) {
      console.warn("Qdrant not ready at boot:", e?.message || e);
    }
    const PORT = parseInt(process.env.PORT || "8080", 10);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
})();
