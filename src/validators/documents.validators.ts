import { body } from "express-validator";
import db from "../db/models";
const { Collection } = db as any;

export const uploadDocumentValidators = [
  body("collectionId")
    .exists({ checkFalsy: true })
    .withMessage("Collection ID is required")
    .isInt({ gt: 0 })
    .withMessage("Collection ID must be a positive integer")
    .bail()
    .custom(async (value, { req }) => {
      const col = await Collection.findOne({
        where: {
          id: Number(value),
          orgid: (req as any).orgid,
          userId: (req as any).userId,
        },
      });
      if (!col) throw new Error("Collection not found for this user/org");
      return true;
    }),

  body("title")
    .exists({ checkFalsy: true })
    .withMessage("Document title is required")
    .isString()
    .withMessage("Document title must be a string")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Document title must be between 2 and 255 characters"),

  body("content")
    .exists({ checkFalsy: true })
    .withMessage("Document content/description is required")
    .isString()
    .withMessage("Document content must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Document content cannot be empty"),

  body("file").custom((_, { req }) => {
    if (!req.file) throw new Error("File is required");
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(req.file.mimetype)) {
      throw new Error("Unsupported file type (allowed: pdf, txt)");
    }
    if (req.file.size > 15 * 1024 * 1024) {
      throw new Error("File too large (max 15MB)");
    }
    return true;
  }),
];
