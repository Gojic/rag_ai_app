import bcrypt from "bcrypt";
import { IUserRepository } from "../repository/auth.repository";
import {
  CreateUserInputDTO,
  UserDTO,
  UserEntity,
  LoginDTO,
} from "../domain/auth.types";
import { AppError } from "../utils/AppError";
export interface IAuthService {
  register(data: CreateUserInputDTO): Promise<UserDTO>;
  validateUser(data: LoginDTO): Promise<UserEntity>;
  generateOrgId(): string;
  mapToDTO(user: UserEntity): UserDTO;
}

export const createAuthService = (userRepo: IUserRepository): IAuthService => {
  const generateOrgId = (): string => {
    return "ORG_" + Math.random().toString(36).slice(2, 8).toUpperCase();
  };

  const mapToDTO = (user: UserEntity): UserDTO => ({
    id: user.id,
    username: user.username,
    email: user.email,
    orgid: user.orgid,
  });

  return {
    generateOrgId,
    mapToDTO,

    async register(data: CreateUserInputDTO): Promise<UserDTO> {
      const exists = await userRepo.findByEmail(data.email);
      if (exists) throw new AppError("User already exists", 409, "USER_EXISTS");

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const orgid = generateOrgId();

      const user = await userRepo.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        orgid,
      });

      return mapToDTO(user);
    },

    async validateUser(data: LoginDTO): Promise<UserEntity> {
      const user = await userRepo.findByEmail(data.email);
      if (!user) throw new AppError("User not found", 401, "USER_NOT_FOUND");

      const ok = await bcrypt.compare(data.password, user.password);
      if (!ok)
        throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

      return user;
    },
  };
};
