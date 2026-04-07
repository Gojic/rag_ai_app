import { Router } from "express";
import authenticate from "../middleware/is-auth";
import { createCollectionValidators } from "../validators/collection.validators";
import { validate } from "../middleware/validators";
import { createCollectionController } from "../controllers/collections.controller";

export const createCollectionsRouter = (
  controller: ReturnType<typeof createCollectionController>,
) => {
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
   *         description: Collection created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  router.post(
    "/create",
    authenticate,
    createCollectionValidators,
    validate,
    controller.createCollection,
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
   *         description: Unauthorized
   */
  router.get("/", authenticate, controller.getCollection);

  return router;
};
