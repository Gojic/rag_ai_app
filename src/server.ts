import app from "./app";
import db from "./db/models";
import { ensureQdrant } from "./rag/qdrant.client";

const { sequelize } = db as any;

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
    /*app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });*/
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
})();
