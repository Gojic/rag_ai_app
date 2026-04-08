import { ModelStatic, Model } from "sequelize";
import { DocumentEntity, DocumentChunkEntity } from "../domain/ingest.types";

export interface IIndexRepository {
  findDocumentById(id: number): Promise<DocumentEntity | null>;
  findChunksByDocumentId(documentId: number): Promise<DocumentChunkEntity[]>;
}

export const createIndexRepository = (
  DocumentModel: ModelStatic<Model<DocumentEntity, any>>,
  DocumentChunksModel: ModelStatic<Model<DocumentChunkEntity, any>>,
): IIndexRepository => {
  return {
    async findDocumentById(id: number): Promise<DocumentEntity | null> {
      const row = await DocumentModel.findByPk(id);
      return row ? (row.get({ plain: true }) as DocumentEntity) : null;
    },
    async findChunksByDocumentId(
      documentId: number,
    ): Promise<DocumentChunkEntity[]> {
      const rows = await DocumentChunksModel.findAll({
        where: { documentId },
        order: [["chunkIndex", "ASC"]],
      });
      return rows.map((r) => r.get({ plain: true }) as DocumentChunkEntity);
    },
  };
};
