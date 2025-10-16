import "dotenv/config";
import express from "express";
import cors from "cors";
import documentsRoute from "./routes/documentsRoute";
import collectionsRoute from "./routes/collectionsRoute";
import ragRoute from "./routes/ragRoute";
import ingestRoute from "./routes/ingestRoute";
import authRoutes from "./routes/authRoutes";
const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/documents", documentsRoute);
app.use("/collections", collectionsRoute);
app.use("/ingest", ingestRoute);
app.use("/rag", ragRoute);

export default app;
