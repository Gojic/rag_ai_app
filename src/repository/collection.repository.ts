import {
  CreateCollectionDTO,
  CollectionEntity,
} from "../domain/colections.types";
import { ModelStatic, Model } from "sequelize";

export interface ICollectionRepository {
  createCollection(data: CreateCollectionDTO): Promise<CollectionEntity>;
  getCollection(orgId: string, userId: number): Promise<CollectionEntity[]>;
}

export const createCollectionRepository = (
  CollectionModel: ModelStatic<Model<CollectionEntity, CreateCollectionDTO>>,
): ICollectionRepository => {
  return {
    async createCollection(
      data: CreateCollectionDTO,
    ): Promise<CollectionEntity> {
      const colections = await CollectionModel.create(data);
      return colections.get({ plain: true }) as CollectionEntity;
    },

    async getCollection(
      orgid: string,
      userId: number,
    ): Promise<CollectionEntity[]> {
      const rows = await CollectionModel.findAll({
        where: { orgid, userId },
        order: [["createdAt", "DESC"]],
      });
      return rows.map((row) => row.get({ plain: true }) as CollectionEntity);
    },
  };
};
