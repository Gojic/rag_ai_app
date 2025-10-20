import { Router } from "express";
import { ragQuery } from "../controllers/ragController";
import authenticate from "../middleware/is-auth";
import { validate } from "../middleware/validators";
import { ragQueryValidators } from "../validators/rag.validators";
const router = Router();

router.post("/query", authenticate, ragQueryValidators, validate, ragQuery);
export default router;
