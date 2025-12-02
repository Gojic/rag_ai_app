import "dotenv/config";
import express from "express";
import cors from "cors";
import documentsRoute from "./routes/documents.route";
import collectionsRoute from "./routes/collections.route";
import ragRoute from "./routes/rag.route";
import ingestRoute from "./routes/ingest.route";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/documents", documentsRoute);
app.use("/collections", collectionsRoute);
app.use("/ingest", ingestRoute);
app.use("/rag", ragRoute);
app.use((_req, res) =>
  res.status(404).json({ error: { message: "Not found" } })
);
app.use(errorHandler);
export default app;
