import { CreateDocInputDTO, DocumentEntity } from "../domain/ingest.types";
import { ModelStatic, Model } from "sequelize";
import {
  CollectionEntity,
  CreateCollectionDTO,
} from "../domain/colections.types";
export interface IDocumentRepository {
  findCollection(id: number, orgId: string): Promise<CollectionEntity | null>;
  findByS3Key(orgId: string, s3Key: string): Promise<DocumentEntity | null>;
  createDocument(data: CreateDocInputDTO): Promise<DocumentEntity>;
  findById(id: string): Promise<DocumentEntity | null>;
  findByCollection(collectionId: string): Promise<DocumentEntity[]>;
}
export const createDocumentRepository = (
  DocumentModel: ModelStatic<Model<DocumentEntity, CreateDocInputDTO>>,
  CollectionModel: ModelStatic<Model<CollectionEntity, CreateCollectionDTO>>,
): IDocumentRepository => {
  return {
    async findCollection(
      id: number,
      orgid: string,
    ): Promise<CollectionEntity | null> {
      const row = await CollectionModel.findOne({ where: { id, orgid } });
      return row ? (row.get({ plain: true }) as CollectionEntity) : null;
    },
    async findByS3Key(
      orgid: string,
      s3Key: string,
    ): Promise<DocumentEntity | null> {
      const row = await DocumentModel.findOne({ where: { orgid, s3Key } });
      return row ? (row.get({ plain: true }) as DocumentEntity) : null;
    },
    async createDocument(data: CreateDocInputDTO): Promise<DocumentEntity> {
      const doc = await DocumentModel.create(data);
      return doc.get({ plain: true }) as DocumentEntity;
    },
    async findById(id: string): Promise<DocumentEntity | null> {
      const row = await DocumentModel.findByPk(id);
      return row ? (row.get({ plain: true }) as DocumentEntity) : null;
    },
    async findByCollection(collectionId: string): Promise<DocumentEntity[]> {
      const rows = await DocumentModel.findAll({
        where: { collectionId },
        order: [["createdAt", "DESC"]],
      });
      return rows.map((row) => row.get({ plain: true }) as DocumentEntity);
    },
  };
};
