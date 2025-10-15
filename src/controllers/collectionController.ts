import { Request, Response } from "express";
import * as collections from "../services/createCollection";
export const createCollection = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  try {
    const collection = await collections.createCollection({
      orgid: (req as any).orgid,
      userId: (req as any).userId,
      name,
      description,
    });
    return res.status(201).json({ collection: collection });
  } catch (error) {
    console.error("Error creating collection:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCollection = async (req: Request, res: Response) => {
  try {
    const col = await collections.getCollection((req as any).orgid);

    return res.status(200).json({
      collections: col,
    });
  } catch (e: any) {
    const msg =
      e.message === "Collection not found for this org" ||
      e.message === "collectionId is requred"
        ? 400
        : 500;

    return res.status(msg).json({ message: e.message || "Server error" });
  }
};
