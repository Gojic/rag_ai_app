// src/middleware/org.ts
import { Request, Response, NextFunction } from "express";

export function attachOrg(req: Request, _res: Response, next: NextFunction) {
  (req as any).orgid = "ORG_DEMO";
  next();
}
export default attachOrg;
