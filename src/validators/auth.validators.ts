import { body } from "express-validator";
import db from "../db/models";
const { User } = db as any;

export const registerValidators = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .bail()
    .custom(async (email) => {
      const exists = await User.findOne({ where: { email } });
      if (exists) throw new Error("Email is already in use");
      return true;
    }),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Must contain at least one digit"),

  /* body('confirmPassword')
         .custom((val, { req }) => val === req.body.password)
         .withMessage('Passwords do not match'), */

  body("username")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2–50 characters long")
    .matches(/^[\p{L}\s'-]+$/u)
    .withMessage("Name contains invalid characters"),
];
export const loginValidators = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password")
    .isString()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
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
export const uploadDocumentValidators = [
  body("collectionId")
    .exists({ checkFalsy: true })
    .withMessage("Collection ID is required")
    .isInt({ gt: 0 })
    .withMessage("Collection ID must be a positive integer")
    // ✨ Preporučena nadogradnja: Provera postojanja u bazi (Async Custom Validation)
    .custom(async (collectionId) => {
      // Ovde bi se koristila funkcija za proveru postojanja kolekcije u DB.
      // Ako ne postoji, baciti grešku: throw new Error('Collection with this ID not found');
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

  body("file").custom((value, { req }) => {
    if (!req.file) throw new Error("File is required");
    return true;
  }),
];
export const ragQueryValidators = [
  body("docId")
    .exists({ checkFalsy: true })
    .withMessage("Document ID is required")
    .isInt({ gt: 0 })
    .withMessage("Document ID must be a positive integer")
    .custom(async (docId) => {
      // Ako bi server preuzeo ID iz URL-a ili sesije, ova provera integriteta bi i dalje bila ključna
      // const exists = await checkDocumentExists(docId);
      // if (!exists) throw new Error('Document not found');
      return true;
    }),

  body("collectionId")
    .exists({ checkFalsy: true })
    .withMessage("Collection ID is required")
    .isInt({ gt: 0 })
    .withMessage("Collection ID must be a positive integer")
    .custom(async (collectionId) => {
      // const exists = await checkCollectionExists(collectionId);
      // if (!exists) throw new Error('Collection not found');
      return true;
    }),

  body("question")
    .exists({ checkFalsy: true })
    .withMessage("Question is required")
    .isString()
    .withMessage("Question must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Question cannot be empty"),

  body("topK")
    .exists({ checkFalsy: true })
    .withMessage("TopK value is required")
    .isInt({ min: 1, max: 20 })
    .withMessage("TopK must be an integer between 1 and 20 (or relevant max)"),
];
