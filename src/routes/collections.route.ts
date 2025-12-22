import { Router } from "express";
import {
  createCollection,
  getCollection,
} from "../controllers/collections.controller";
import authenticate from "../middleware/is-auth";
import { createCollectionValidators } from "../validators/collection.validators";
import { validate } from "../middleware/validators";
const router = Router();

/**
 * @openapi
 * /api/collections/create:
 *   post:
 *     summary: Create a collection
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "my-docs"
 *               description:
 *                 type: string
 *                 example: "Dokumenti za RAG test"
 *     responses:
 *       201:
 *         description: Collection created (or existing returned)
 *       400:
 *         description: Validation error / missing fields
 *       401:
 *         description: Unauthorized (missing/invalid token or missing org/user)
 */
router.post(
  "/create",
  authenticate,
  createCollectionValidators,
  validate,
  createCollection
);
/**
 * @openapi
 * /api/collections:
 *   get:
 *     summary: Get collections for current org and user
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of collections
 *       401:
 *         description: Unauthorized (missing/invalid token or missing org/user)
 */
router.get("/", authenticate, getCollection);
export default router;
