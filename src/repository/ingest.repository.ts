import { ModelStatic, Model, Transaction, Sequelize } from "sequelize";
import {
  DocumentEntity,
  DocumentChunkEntity,
  DocumentInstance,
} from "../domain/ingest.types";

type CreateChunkDTO = Omit<
  DocumentChunkEntity,
  "id" | "createdAt" | "updatedAt"
>;

export interface IIngestRepository {
  findById(id: number): Promise<DocumentInstance | null>;
  transaction<T>(cb: (t: Transaction) => Promise<T>): Promise<T>;
  deleteChunks(documentId: number, t: Transaction): Promise<void>;
  bulkCreateChunks(chunks: CreateChunkDTO[], t: Transaction): Promise<void>;
  updateStatus(id: number, status: string): Promise<void>;
}

export const createIngestRepository = (
  DocumentModel: ModelStatic<Model<DocumentEntity, Partial<DocumentEntity>>>,
  DocumentChunksModel: ModelStatic<Model<DocumentChunkEntity, CreateChunkDTO>>,
  sequelize: Sequelize,
): IIngestRepository => {
  return {
    async findById(id: number): Promise<DocumentInstance | null> {
      const doc = await DocumentModel.findByPk(id);
      return doc ? (doc as unknown as DocumentInstance) : null;
    },

    async transaction<T>(cb: (t: Transaction) => Promise<T>): Promise<T> {
      return await sequelize.transaction(cb);
    },

    async deleteChunks(documentId: number, t: Transaction): Promise<void> {
      await DocumentChunksModel.destroy({
        where: { documentId },
        transaction: t,
      });
    },

    async bulkCreateChunks(
      chunks: CreateChunkDTO[],
      t: Transaction,
    ): Promise<void> {
      await DocumentChunksModel.bulkCreate(chunks, { transaction: t });
    },

    async updateStatus(id: number, status: string): Promise<void> {
      await DocumentModel.update({ status }, { where: { id } });
    },
  };
};
