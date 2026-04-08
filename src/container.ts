import { DB } from "./db/db.types";
import { createUserRepository } from "./repository/auth.repository";
import { createAuthService } from "./services/auth.service";
import { createAuthController } from "./controllers/auth.controller";
import { createCollectionRepository } from "./repository/collection.repository";
import { createCollectionService } from "./services/collections.service";
import { createCollectionController } from "./controllers/collections.controller";
import { createDocumentController } from "./controllers/documents.controller";
import { createDocumentService } from "./services/document.service";
import { createDocumentRepository } from "./repository/document.repository";
import { createIndexRepository } from "./repository/index.repository";
import { createIndexService } from "./services/index.service";
import { createIngestRepository } from "./repository/ingest.repository";
import { createIngestService } from "./services/ingest.service";
import { createIngestController } from "./controllers/ingest.controller";
import { createRAGRepository } from "./repository/rag.repository";
import { createRAGService } from "./services/rag.services";
import { createRAGController } from "./controllers/rag.controller";

export const initContainer = (db: DB, jwtSecret: string) => {
  // 1. AUTH
  const userRepo = createUserRepository(db.User);
  const authService = createAuthService(userRepo);
  const authController = createAuthController(authService, jwtSecret);

  // 2. COLLECTION
  const collectionRepo = createCollectionRepository(db.Collection);
  const collectionService = createCollectionService(collectionRepo);
  const collectionController = createCollectionController(collectionService);

  //3 DOCUMENT
  const documentRepo = createDocumentRepository(db.Document, db.Collection);
  const documentService = createDocumentService(documentRepo);
  const documentController = createDocumentController(documentService);

  // 4. INGEST
  const ingestRepo = createIngestRepository(
    db.Document,
    db.DocumentChunks,
    db.sequelize,
  );
  const ingestService = createIngestService(ingestRepo);
  const ingestController = createIngestController(ingestService);

  // 5. INDEX / QDRANT
  const indexRepo = createIndexRepository(db.Document, db.DocumentChunks);
  const indexService = createIndexService(indexRepo);

  // 6. RAG
  const ragRepo = createRAGRepository(db.DocumentChunks);
  const ragService = createRAGService(ragRepo);
  const ragController = createRAGController(ragService);
  return {
    authController,
    collectionController,
    documentController,
    ingestService,
    ingestController,
    indexService,
    ragController,
  };
};

export type AppContainer = ReturnType<typeof initContainer>;
