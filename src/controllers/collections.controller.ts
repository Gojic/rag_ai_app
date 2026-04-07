import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { CreateCollectionInputDTO } from "../domain/colections.types";
import { ICollectionService } from "../services/collections.service";

export const createCollectionController = (
  collectionService: ICollectionService,
) => {
  return {
    createCollection: asyncHandler(async (req: Request, res: Response) => {
      const { name, description } = req.body as CreateCollectionInputDTO;

      const orgid = (req as any).orgid;
      const userId = (req as any).userId;

      if (!orgid || !userId)
        throw new AppError("Unauthorized", 401, "NO_ORG_OR_USER");

      const collection = await collectionService.createCollection({
        orgid,
        userId,
        name,
        description,
      });

      return res.status(201).json({ collection });
    }),

    getCollection: asyncHandler(async (req: Request, res: Response) => {
      const orgid = (req as any).orgid;
      const userId = (req as any).userId;

      if (!orgid || !userId)
        throw new AppError("Unauthorized", 401, "NO_ORG_OR_USER");

      const col = await collectionService.getCollection(orgid, userId);

      return res.status(200).json({
        collections: col,
      });
    }),
  };
};
