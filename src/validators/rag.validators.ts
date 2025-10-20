import { body } from "express-validator";
import db from "../db/models";
const { Collection, Document } = db as any;

export const ragQueryValidators = [
  body("docId")
    .exists({ checkFalsy: true })
    .withMessage("Document ID is required")
    .isInt({ gt: 0 })
    .withMessage("Document ID must be a positive integer")
    .bail()
    .custom(async (docId, { req }) => {
      const doc = await Document.findOne({
        where: {
          id: Number(docId),
          orgid: (req as any).orgid,
          collectionId: Number(req.body.collectionId),
        },
      });
      if (!doc) throw new Error("Document not found for this org/collection");
      return true;
    }),

  body("collectionId")
    .exists({ checkFalsy: true })
    .withMessage("Collection ID is required")
    .isInt({ gt: 0 })
    .withMessage("Collection ID must be a positive integer")
    .bail()
    .custom(async (collectionId, { req }) => {
      const col = await Collection.findOne({
        where: { id: Number(collectionId), orgid: (req as any).orgid },
      });
      if (!col) throw new Error("Collection not found for this org");
      return true;
    }),

  body("question")
    .exists({ checkFalsy: true })
    .withMessage("Question is required")
    .isString()
    .withMessage("Question must be a string")
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage("Question length must be 3–2000 chars"),

  body("topK")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("topK must be an integer between 1 and 20"),
];
