import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
export interface AuthRequest extends Request {
  userId?: number;
  orgid?: string;
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new AppError("Not authenticated (no token).", 401, "NO_TOKEN");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AppError("Bad Authorization header format.", 401, "BAD_HEADER");
  }
  const token = parts[1];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError(
      "JWT secret is not defined on server.",
      500,
      "MISSING_SECRET"
    );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
      orgid?: string;
      iat: number;
      exp: number;
    };
    req.userId = decoded.userId;
    req.orgid = decoded.orgid ?? "ORG_DEMO";
    next();
  } catch (err: unknown) {
    if (typeof err === "object" && err && "name" in err) {
      const e = err as { name: string };

      if (e.name === "TokenExpiredError") {
        throw new AppError("Token has expired.", 401, "TOKEN_EXPIRED");
      }
      throw new AppError(
        "Not authenticated (invalid token).",
        401,
        "INVALID_TOKEN"
      );
    }
  }
};
export default authenticate;
