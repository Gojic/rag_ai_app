import { Router } from "express";
import {
  createCollection,
  getCollection,
} from "../controllers/collectionController";
import authenticate from "../middleware/is-auth";

const router = Router();

router.post("/create", authenticate, createCollection);
router.get("/", authenticate, getCollection);
export default router;
