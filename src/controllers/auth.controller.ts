import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { IAuthService } from "../services/auth.service"; // Putanja do tvog novog servisa
import { CreateUserInputDTO, LoginDTO, JwtPayload } from "../domain/auth.types";

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
      };
      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        message: "Logged in",
        token,
        user: authService.mapToDTO(user),
      });
    }),
  };
};
