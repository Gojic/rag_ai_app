import { validationResult } from "express-validator";
import type { Request } from "express";

export async function runValidators(validators: any[], body: any) {
  const req = { body } as Request;
  for (const v of validators) {
    await v.run(req);
  }
  return validationResult(req)
    .array()
    .map((e) => ({
      field: (e as any).path ?? (e as any).param,
      message: String(e.msg),
    }));
}
