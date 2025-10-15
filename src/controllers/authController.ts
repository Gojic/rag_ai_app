import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as users from "../services/user.services";
import jwt from "jsonwebtoken";

export const signUp = async (req: Request, res: Response) => {
  const { username, password, email /*, orgid: orgFromBody */ } = req.body;
  try {
    const chekUser = await users.getUser(email);
    if (chekUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const orgid = /* orgFromBody || */ users.genOrgId();
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
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await users.getUser(email);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
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
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
