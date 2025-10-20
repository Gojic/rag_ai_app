import { body } from "express-validator";

export const createCollectionValidators = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Collection name is required")
    .isString()
    .withMessage("Collection name must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Collection name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Collection description must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Collection description cannot exceed 500 characters"),
];
