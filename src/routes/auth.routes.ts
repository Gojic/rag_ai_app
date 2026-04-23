import { RequestHandler, Router } from "express";
import { validate } from "../middleware/validators";
import {
  registerValidators,
  loginValidators,
} from "../validators/auth.validators";
import { createAuthController } from "../controllers/auth.controller";
import { createRefreshMiddleware } from "../middleware/refresh.middleware";
import { IAuthService } from "../services/auth.service";
export const createAuthRouter = (
  controller: ReturnType<typeof createAuthController>,
  authService: IAuthService,
  authMiddleware: RequestHandler,
) => {
  const router = Router();
  const isRefreshValid = createRefreshMiddleware(authService);
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
  /**
   * @openapi
   * /api/auth/logout:
   *   post:
   *     summary: Logout current session
   *     tags:
   *       - Auth
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logged out successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Logged out"
   *       401:
   *         description: Unauthorized - missing or invalid access token
   */
  router.post("/logout", authMiddleware, controller.logout);
  /**
   * @openapi
   * /api/auth/refresh:
   *   post:
   *     summary: Refresh access token using refresh token cookie
   *     tags:
   *       - Auth
   *     description: >
   *       Requires a valid `refreshToken` cookie. Returns a new access token.
   *       If the session has been revoked, the cookie will be cleared.
   *     responses:
   *       200:
   *         description: New access token issued
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Token refreshed"
   *                 accessToken:
   *                   type: string
   *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       401:
   *         description: No refresh token / session revoked / user not found
   */
  router.post("/refresh", isRefreshValid, controller.refresh);
  /**
   * @openapi
   * /api/auth/revoke-all:
   *   post:
   *     summary: Revoke all active sessions for current user
   *     tags:
   *       - Auth
   *     security:
   *       - bearerAuth: []
   *     description: >
   *       Invalidates all existing access and refresh tokens for the current user
   *       by incrementing the token version in Redis.
   *       All devices will be logged out.
   *     responses:
   *       200:
   *         description: All sessions revoked
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "All sessions revoked"
   *       401:
   *         description: Unauthorized - missing or invalid access token
   */
  router.post("/revoke-all", authMiddleware, controller.revokeAll);
  return router;
};
