import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userId?: number;
  orgid?: string;
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Not authenticated (no token)." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Bad Authorization header." });
  }
  const token = parts[1];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT secret is not defined." });
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
  } catch {
    return res
      .status(401)
      .json({ message: "Not authenticated (invalid token)." });
  }
};

export default authenticate;
