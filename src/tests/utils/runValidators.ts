import { validationResult } from "express-validator";
import type { Request } from "express";

export async function runValidators(
  validators: any[],
  body: any,
  extras?: any
) {
  const req: any = { body, ...extras };

  for (const v of validators) {
    await v.run(req as Request);
  }

  return validationResult(req as Request)
    .array()
    .map((e: any) => ({
      field: e.path ?? e.param,
      message: String(e.msg),
    }));
}
