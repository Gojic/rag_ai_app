import { ModelStatic, Model } from "sequelize";
import { DocumentChunkEntity } from "../domain/ingest.types";

export interface IRAGRepository {
  findChunksByIndexes(
    documentId: number,
    indexes: number[],
  ): Promise<DocumentChunkEntity[]>;
}

export const createRAGRepository = (
  DocumentChunksModel: ModelStatic<Model<DocumentChunkEntity, any>>,
): IRAGRepository => {
  return {
    async findChunksByIndexes(
      documentId: number,
      indexes: number[],
    ): Promise<DocumentChunkEntity[]> {
      const rows = await DocumentChunksModel.findAll({
        where: { documentId, chunkIndex: indexes },
        order: [["chunkIndex", "ASC"]],
      });
      return rows.map((r) => r.get({ plain: true }) as DocumentChunkEntity);
    },
  };
};
