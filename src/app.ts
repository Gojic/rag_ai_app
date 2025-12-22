import "dotenv/config";
import express from "express";
import cors from "cors";
import documentsRoute from "./routes/documents.route";
import collectionsRoute from "./routes/collections.route";
import ragRoute from "./routes/rag.route";
import ingestRoute from "./routes/ingest.route";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec, swaggerUi } from "./swagger";
const app = express();

app.use(express.json());
app.use(cors());
const API_PREFIX = "/api";
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/documents`, documentsRoute);
app.use(`${API_PREFIX}/collections`, collectionsRoute);
app.use(`${API_PREFIX}/ingest`, ingestRoute);
app.use(`${API_PREFIX}/rag`, ragRoute);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
  })
);

app.use((_req, res) =>
  res.status(404).json({ error: { message: "Not found" } })
);
app.use(errorHandler);
export default app;
