import { AppError } from "../utils/AppError";
import { ICollectionRepository } from "../repository/collection.repository";
import {
  CreateCollectionDTO,
  CollectionDTO,
  CollectionEntity,
} from "../domain/colections.types";

export interface ICollectionService {
  createCollection(data: CreateCollectionDTO): Promise<CollectionDTO>;
  getCollection(orgid: string, userId: number): Promise<CollectionDTO[]>;
  mapToDTO(collection: CollectionEntity): CollectionDTO;
}
export const createCollectionService = (
  collectionRepo: ICollectionRepository,
): ICollectionService => {
  const mapToDTO = (collection: CollectionEntity): CollectionDTO => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    orgid: collection.orgid,
  });

  return {
    mapToDTO,
    async createCollection(data: CreateCollectionDTO): Promise<CollectionDTO> {
      if (!data.orgid)
        throw new AppError("orgid is required", 400, "ORG_REQUIRED");
      if (!data.userId)
        throw new AppError("userId is required", 400, "USER_REQUIRED");
      if (!data.name)
        throw new AppError("name is required", 400, "NAME_REQUIRED");
      const collection = await collectionRepo.createCollection(data);
      return mapToDTO(collection);
    },
    async getCollection(
      orgid: string,
      userId: number,
    ): Promise<CollectionDTO[]> {
      if (!orgid || !userId)
        throw new AppError("Orgid and UserId are required", 400);
      const collections = await collectionRepo.getCollection(orgid, userId);
      return collections.map(mapToDTO);
    },
  };
};
