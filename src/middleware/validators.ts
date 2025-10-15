import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result
      .formatWith((e: any) => ({
        field: e.path ?? e.param,
        message: String(e.msg),
      }))
      .array({ onlyFirstError: true });
    return res.status(422).json({ errors });
  }
  next();
};
