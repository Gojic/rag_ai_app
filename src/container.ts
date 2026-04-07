import { DB } from "./db/db.types";
import { createUserRepository } from "./repository/auth.repository";
import { createAuthService } from "./services/auth.service";
import { createAuthController } from "./controllers/auth.controller";
import { createCollectionRepository } from "./repository/collection.repository";
import { createCollectionService } from "./services/collections.service";
import { createCollectionController } from "./controllers/collections.controller";

export const initContainer = (db: DB, jwtSecret: string) => {
  // 1. AUTH
  const userRepo = createUserRepository(db.User);
  const authService = createAuthService(userRepo);
  const authController = createAuthController(authService, jwtSecret);

  // 2. COLLECTION
  const collectionRepo = createCollectionRepository(db.Collection);
  const collectionService = createCollectionService(collectionRepo);
  const collectionController = createCollectionController(collectionService);

  return {
    authController,
    collectionController,
  };
};

export type AppContainer = ReturnType<typeof initContainer>;
