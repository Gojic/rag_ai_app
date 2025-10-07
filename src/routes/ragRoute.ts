import { Router } from "express";
import { ragQuery } from "../controllers/ragController";
const router = Router();
console.log("rute");
router.post("/query", ragQuery);
export default router;
