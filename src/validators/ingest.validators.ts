import { param } from "express-validator";

export const ingestStartValidators = [
  param("documentId")
    .isInt({ gt: 0 })
    .withMessage("documentId must be a positive integer"),
];
