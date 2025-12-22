import { body } from "express-validator";
import db from "../db/models";
const anyDb = db as any;
const sequelize = anyDb.sequelize;
const User = sequelize.models.User;
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
