import { Router } from "express";
import {
  createCollection,
  getCollection,
} from "../controllers/collectionController";
const router = Router();

router.post("/create", createCollection);
router.get("/", getCollection);
export default router;
