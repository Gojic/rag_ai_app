import { Router } from "express";
import { ragQuery } from "../controllers/ragController";
import authenticate from "../middleware/is-auth";
const router = Router();

router.post("/query", authenticate, ragQuery);
export default router;
