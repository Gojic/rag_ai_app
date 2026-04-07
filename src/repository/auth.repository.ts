import { UserEntity, CreateUserDTO } from "../domain/auth.types";
import { ModelStatic, Model } from "sequelize";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
  create(data: CreateUserDTO): Promise<UserEntity>;
}

export const createUserRepository = (
  UserModel: ModelStatic<Model<UserEntity, CreateUserDTO>>,
): IUserRepository => {
  return {
    async findByEmail(email: string): Promise<UserEntity | null> {
      const user = await UserModel.findOne({ where: { email } });
      return user ? (user.get({ plain: true }) as UserEntity) : null;
    },

    async findById(id: number): Promise<UserEntity | null> {
      const user = await UserModel.findByPk(id);
      return user ? (user.get({ plain: true }) as UserEntity) : null;
    },

    async create(data: CreateUserDTO): Promise<UserEntity> {
      const user = await UserModel.create(data);
      return user.get({ plain: true }) as UserEntity;
    },
  };
};
