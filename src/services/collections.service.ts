import db from "../db/models";
import { AppError } from "../utils/AppError";
const { Collection } = db as any;
import {
  CreateCollectionDTO,
  CollectionDTO,
  CollectionEntity,
} from "../domain/documents.types";

export async function createCollection(
  input: CreateCollectionDTO
): Promise<CollectionDTO> {
  if (!input.orgid)
    throw new AppError("orgid is required", 400, "ORG_REQUIRED");
  if (!input.userId)
    throw new AppError("userId is required", 400, "USER_REQUIRED");
  if (!input.name) throw new AppError("name is required", 400, "NAME_REQUIRED");
  const existing = (await Collection.findOne({
    where: {
      name: input.name,
      orgid: input.orgid,
      userId: input.userId,
    },
  })) as CollectionEntity | null;
  if (existing) return mapCollectionToDTO(existing);

  const created = (await Collection.create(input)) as CollectionEntity;

  return mapCollectionToDTO(created);
}

export async function getCollection(
  orgid: string,
  userId: number
): Promise<CollectionDTO[]> {
  if (!orgid) throw new AppError("orgid must be passed", 400, "ORG_REQUIRED");
  if (!userId)
    throw new AppError("userId must be passed", 400, "USER_REQUIRED");

  const rows = (await Collection.findAll({
    where: { orgid, userId },
    order: [["createdAt", "DESC"]],
  })) as CollectionEntity[];

  return rows.map(mapCollectionToDTO);
}

export function mapCollectionToDTO(
  collection: CollectionEntity
): CollectionDTO {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    orgid: collection.orgid,
  };
}
