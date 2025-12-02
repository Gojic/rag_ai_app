import db from "../db/models";
import { AppError } from "../utils/AppError";
const { Collection } = db as any;
import {
  CreateCollectionDTO,
  CollectionDTO,
  CollectionEntity,
} from "../domain/colections.types";
// **************************************************************
// createCollection
// → Servis koji kreira kolekciju ili vraća već postojeću
// → Prima: CreateCollectionDTO (sa orgid + userId, backend vrednosti)
// → Vraća: CollectionDTO (bezbedan objekat za frontend)
// **************************************************************
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

// **************************************************************
// getCollection
// → Vraća sve kolekcije za zadati orgid i userId
// → Vraća niz DTO objekata (bezbednih za frontend)
// **************************************************************
export async function getCollection(
  orgid: string,
  userId: number
): Promise<CollectionDTO[] | null> {
  if (!orgid) throw new AppError("orgid must be passed", 400, "ORG_REQUIRED");
  if (!userId)
    throw new AppError("userId must be passed", 400, "USER_REQUIRED");

  const rows = (await Collection.findAll({
    where: { orgid, userId },
    order: [["createdAt", "DESC"]],
  })) as CollectionEntity[] | null;

  if (!rows) return [];
  return rows.map(mapCollectionToDTO);
}

// **************************************************************
// mapCollectionToDTO
// → Pretvara Sequelize entitet (sa userId i timestampovima)
//   u Object koji je bezbedan za frontend
// **************************************************************
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
