import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { IAuthService } from "../services/auth.service"; // Putanja do tvog novog servisa
import {
  CreateUserInputDTO,
  LoginDTO,
  JwtPayload,
  RefreshTokenPayload,
} from "../domain/auth.types";
import { AppError } from "../utils/AppError";
export const createAuthController = (
  authService: IAuthService,
  jwtSecret: string,
) => {
  return {
    signUp: asyncHandler(async (req: Request, res: Response) => {
      const body = req.body as CreateUserInputDTO;

      const newUser = await authService.register(body);

      return res.status(201).json({
        message: "User Created",
        user: newUser,
      });
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
      const body = req.body as LoginDTO;
      const user = await authService.validateUser(body);

      const payload: JwtPayload = {
        userId: user.id,
        orgid: user.orgid,
        tokenVersion: user.tokenVersion,
      };
      const accessToken = jwt.sign(payload, jwtSecret, {
        expiresIn: "15m",
      });
      const refreshPayload: RefreshTokenPayload = {
        userId: user.id,
        tokenVersion: user.tokenVersion,
      };

      const refreshToken = jwt.sign(
        refreshPayload,
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" },
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // ako je na lajvu onda ide true
        sameSite: "strict",
        path: "/api/auth/refresh",
      });
      return res.status(200).json({
        message: "Logged in",
        accessToken,
        user: authService.mapToDTO(user),
      });
    }),
    logout: asyncHandler(async (req: Request, res: Response) => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      await authService.logout(userId);
      res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

      return res.status(200).json({ message: "Logged out" });
    }),
    revokeAll: asyncHandler(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);

      await authService.revokeAllSessions(userId);

      res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
      return res.status(200).json({ message: "All sessions revoked" });
    }),
    refresh: asyncHandler(async (req: Request, res: Response) => {
      const user = req.user!;

      const payload: JwtPayload = {
        userId: user.userId,
        orgid: user.orgid,
        tokenVersion: user.tokenVersion,
      };

      const accessToken = jwt.sign(payload, jwtSecret, {
        expiresIn: "15m",
      });

      return res.status(200).json({
        message: "Token refreshed",
        accessToken,
      });
    }),
  };
};
