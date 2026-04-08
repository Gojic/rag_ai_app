import { ModelStatic, Model } from "sequelize";
import { DocumentEntity } from "../domain/ingest.types";

export interface IWorkerRepository {
  findNextPending(): Promise<number | null>;
  claimDocument(id: number): Promise<boolean>;
  updateStatus(id: number, status: string): Promise<void>;
}

export const createWorkerRepository = (
  DocumentModel: ModelStatic<Model<DocumentEntity, any>>,
): IWorkerRepository => {
  return {
    async findNextPending(): Promise<number | null> {
      const next = await DocumentModel.findOne({
        where: { status: "PENDING" },
        order: [["createdAt", "ASC"]],
        attributes: ["id"],
      });
      return next ? (next.get("id") as number) : null;
    },

    async claimDocument(id: number): Promise<boolean> {
      const [affected] = await DocumentModel.update(
        { status: "RUNNING" },
        { where: { id, status: "PENDING" } },
      );
      return affected === 1;
    },

    async updateStatus(id: number, status: string): Promise<void> {
      await DocumentModel.update({ status }, { where: { id } });
    },
  };
};
