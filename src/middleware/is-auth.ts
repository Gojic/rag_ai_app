import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { IAuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export interface AuthRequest extends Request {
  userId?: number;
  orgid?: string;
}

export const createAuthMiddleware = (authService: IAuthService) => {
  return asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        throw new AppError("Not authenticated (no token).", 401, "NO_TOKEN");
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new AppError(
          "Bad Authorization header format.",
          401,
          "BAD_HEADER",
        );
      }

      const token = parts[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError("JWT secret is not defined.", 500, "MISSING_SECRET");
      }

      let decoded: {
        userId: number;
        orgid?: string;
        tokenVersion?: number;
        iat: number;
        exp: number;
      };

      try {
        decoded = jwt.verify(token, jwtSecret) as typeof decoded;
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          throw new AppError("Token has expired.", 401, "TOKEN_EXPIRED");
        }
        throw new AppError(
          "Not authenticated (invalid token).",
          401,
          "INVALID_TOKEN",
        );
      }

      const currentVersion = await authService.getTokenVersion(decoded.userId);
      if (decoded.tokenVersion !== currentVersion) {
        throw new AppError("Session revoked", 401, "SESSION_REVOKED");
      }

      req.user = {
        userId: decoded.userId,
        orgid: decoded.orgid ?? "ORG_DEMO",
        tokenVersion: currentVersion,
      };
      req.userId = decoded.userId;
      req.orgid = decoded.orgid ?? "ORG_DEMO";

      next();
    },
  );
};
