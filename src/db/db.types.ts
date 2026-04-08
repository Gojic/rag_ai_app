import { ModelStatic, Model, Sequelize } from "sequelize";
import { UserEntity, CreateUserDTO } from "../domain/auth.types";
import {
  CollectionEntity,
  CreateCollectionDTO,
} from "../domain/colections.types";
import {
  CreateDocInputDTO,
  DocumentEntity,
  DocumentChunkEntity,
} from "../domain/ingest.types";
export type DB = {
  sequelize: Sequelize;
  Sequelize: any;
  User: ModelStatic<Model<UserEntity, CreateUserDTO>>;
  Collection: ModelStatic<Model<CollectionEntity, CreateCollectionDTO>>;
  Document: ModelStatic<Model<DocumentEntity, CreateDocInputDTO>>;
  DocumentChunks: ModelStatic<Model<DocumentChunkEntity>>;
};
