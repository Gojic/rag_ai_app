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
