import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createDocumentRouter } from "./routes/documents.route";
import { createCollectionsRouter } from "./routes/collections.route";
import { createAuthRouter } from "./routes/auth.routes";
import { createRAGRouter } from "./routes/rag.route";
import { createIngestRouter } from "./routes/ingest.route";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec, swaggerUi } from "./swagger";
import { AppContainer } from "./container";

export const createApp = (container: AppContainer) => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  const API_PREFIX = "/api";
  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use(
    `${API_PREFIX}/auth`,
    createAuthRouter(
      container.authController,
      container.authService,
      container.authMiddleware,
    ),
  );
  app.use(
    `${API_PREFIX}/documents`,
    createDocumentRouter(
      container.documentController,
      container.authMiddleware,
    ),
  );
  app.use(
    `${API_PREFIX}/collections`,
    createCollectionsRouter(
      container.collectionController,
      container.authMiddleware,
    ),
  );
  app.use(
    `${API_PREFIX}/ingest`,
    createIngestRouter(container.ingestController, container.authMiddleware),
  );
  app.use(
    `${API_PREFIX}/rag`,
    createRAGRouter(container.ragController, container.authMiddleware),
  );

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: { persistAuthorization: true },
    }),
  );

  app.use((_req, res) =>
    res.status(404).json({ error: { message: "Not found" } }),
  );
  app.use(errorHandler);

  return app;
};
