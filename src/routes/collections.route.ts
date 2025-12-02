import { Router } from "express";
import {
  createCollection,
  getCollection,
} from "../controllers/collections.controller";
import authenticate from "../middleware/is-auth";
import { createCollectionValidators } from "../validators/collection.validators";
import { validate } from "../middleware/validators";
const router = Router();

router.post(
  "/create",
  authenticate,
  createCollectionValidators,
  validate,
  createCollection
);
router.get("/", authenticate, getCollection);
export default router;
