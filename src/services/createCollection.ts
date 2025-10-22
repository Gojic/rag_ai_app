import db from "../db/models";
import { AppError } from "../utils/AppError";
type CreateCollectionInput = {
  name: string;
  description?: string;
  orgid: string;
  userId: number;
};
export async function createCollection(input: CreateCollectionInput) {
  const { Collection } = db as any;

  if (!input.orgid)
    throw new AppError("orgid is required", 400, "ORG_REQUIRED");
  if (!input.userId)
    throw new AppError("userId is required", 400, "USER_REQUIRED");
  if (!input.name) throw new AppError("name is required", 400, "NAME_REQUIRED");
  const existing = await Collection.findOne({
    where: {
      name: input.name,
      orgid: input.orgid,
      userId: input.userId,
    },
  });
  if (existing) return existing;

  return Collection.create({
    ...input,
  });
}

export async function getCollection(orgid: string, userId: number) {
  const { Collection } = db as any;
  if (!orgid) throw new AppError("orgid must be passed", 400, "ORG_REQUIRED");
  if (!userId)
    throw new AppError("userId must be passed", 400, "USER_REQUIRED");

  return Collection.findAll({
    where: { orgid, userId },
    order: [["createdAt", "DESC"]],
  });
}
