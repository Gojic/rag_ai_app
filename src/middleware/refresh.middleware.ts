import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import jwt from "jsonwebtoken";
import { RefreshTokenPayload } from "../domain/auth.types";
export const createRefreshMiddleware = (authService: IAuthService) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.cookies.refreshToken;
      if (!token) throw new AppError("No refresh token provided", 401);

      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!,
      ) as RefreshTokenPayload;

      const currentVersion = await authService.getTokenVersion(decoded.userId);

      if (decoded.tokenVersion !== currentVersion) {
        res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
        throw new AppError("Session revoked. Please login again.", 401);
      }
      const user = await authService.getUserById(decoded.userId);
      if (!user) throw new AppError("User no longer exists", 401);
      req.user = {
        userId: user.id,
        orgid: user.orgid,
        tokenVersion: currentVersion,
      };
      next();
    },
  );
};
