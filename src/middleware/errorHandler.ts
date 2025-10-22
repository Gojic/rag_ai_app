import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }

  if (err?.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: {
        message: "Resource already exists",
        code: "UNIQUE_CONSTRAINT",
        details: err.errors?.map((e: any) => e.message),
      },
    });
  }

  if (err?.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      error: {
        message: "Invalid reference",
        code: "FK_CONSTRAINT",
        details: { table: err.table, fields: err.fields },
      },
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(422).json({
      error: {
        message: "Validation failed",
        code: "DB_VALIDATION",
        details: err.errors?.map((e: any) => e.message),
      },
    });
  }
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ error: { message: "Invalid or expired token", code: err.name } });
  }

  if (err?.name === "MulterError") {
    return res
      .status(400)
      .json({ error: { message: err.message, code: "UPLOAD_ERROR" } });
  }
  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL",
      ...(isProd
        ? {}
        : { debug: { message: err?.message, stack: err?.stack } }),
    },
  });
}
