import type {
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { Model } from "sequelize";

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare password: string;
  declare orgid: string;
  declare email: string;
}
export class CollectionModel extends Model<
  InferAttributes<CollectionModel>,
  InferCreationAttributes<CollectionModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string;
  declare orgid: string;
}

export class DocumentModel extends Model<
  InferAttributes<DocumentModel>,
  InferCreationAttributes<DocumentModel>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare content: string;
  declare status: string;
  declare mimeType: string;
  declare size: number;
  declare path: string;
  declare checksum: string;
  declare collectionId: number;
  declare s3Key: string;
  declare s3Url: string;
  declare orgid: string;
}

export class DocumentChunksModel extends Model<
  InferAttributes<DocumentChunksModel>,
  InferCreationAttributes<DocumentChunksModel>
> {
  declare id: CreationOptional<number>;
  declare documentId: number;
  declare chunkIndex: number;
  declare text: string;
  declare page: number;
  declare heading: string;
}
