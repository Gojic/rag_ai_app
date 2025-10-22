import { Request, Response } from "express";
import * as collections from "../services/createCollection";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
export const createCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;

    const orgid = (req as any).orgid;
    const userId = (req as any).userId;
    if (!orgid || !userId)
      throw new AppError("Unauthorized", 401, "NO_ORG_OR_USER");
    const collection = await collections.createCollection({
      orgid: orgid,
      userId: userId,
      name,
      description,
    });

    return res.status(201).json({ collection: collection });
  }
);

export const getCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const orgid = (req as any).orgid;
    const userId = (req as any).userId;
    const col = await collections.getCollection(orgid, userId);
    if (!orgid || !userId)
      throw new AppError("Unauthorized", 401, "NO_ORG_OR_USER");
    return res.status(200).json({
      collections: col,
    });
  }
);
