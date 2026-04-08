import { Request, Response } from "express";
import { IRAGService } from "../services/rag.services";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const createRAGController = (ragService: IRAGService) => {
  return {
    query: asyncHandler(async (req: Request, res: Response) => {
      const orgid = (req as any).orgid;
      if (!orgid) throw new AppError("Unauthorized", 401, "NO_ORG");

      const result = await ragService.query(req.body, orgid);
      return res.json(result);
    }),
  };
};
