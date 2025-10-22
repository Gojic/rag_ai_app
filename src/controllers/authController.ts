import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as users from "../services/user.services";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  const exists = await users.getUser(email);
  if (exists) throw new AppError("User already exists", 409, "USER_EXISTS");
  const orgid = users.genOrgId();
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await users.createUser(
    username,
    email,
    hashedPassword,
    orgid
  );

  return res.status(201).json({
    message: "User created",
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await users.getUser(email);
  if (!user) throw new AppError("User not found", 401, "USER_NOT_FOUND");
  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  const jwtSecret = process.env.JWT_SECRET!;
  const token = jwt.sign({ userId: user.id, orgid: user.orgid }, jwtSecret, {
    expiresIn: "1h",
  });
  return res.status(200).json({
    message: "Logged in",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});
