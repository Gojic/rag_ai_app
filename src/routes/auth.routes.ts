import { Router } from "express";
import { login, signUp } from "../controllers/auth.controller";
import { validate } from "../middleware/validators";
import {
  registerValidators,
  loginValidators,
} from "../validators/auth.validators";
const router = Router();
router.post("/signup", registerValidators, validate, signUp);
router.post("/login", loginValidators, validate, login);
export default router;
