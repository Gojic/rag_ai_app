import { Router } from "express";
import { validate } from "../middleware/validators";
import {
  registerValidators,
  loginValidators,
} from "../validators/auth.validators";
import { createAuthController } from "../controllers/auth.controller";

export const createAuthRouter = (
  controller: ReturnType<typeof createAuthController>,
) => {
  const router = Router();

  /**
   * @openapi
   * /api/auth/signup:
   *   post:
   *     summary: Create a new user account
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: "milos"
   *               email:
   *                 type: string
   *                 example: "milos@example.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 example: "StrongPass123!"
   *     responses:
   *       201:
   *         description: User created
   *       409:
   *         description: User already exists
   *       422:
   *         description: Validation error
   */
  router.post("/signup", registerValidators, validate, controller.signUp);

  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     summary: Login and get JWT token
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 example: "milos@example.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 example: "StrongPass123!"
   *     responses:
   *       200:
   *         description: Logged in
   *       401:
   *         description: Invalid credentials / user not found
   *       422:
   *         description: Validation error
   */
  router.post("/login", loginValidators, validate, controller.login);

  return router;
};
