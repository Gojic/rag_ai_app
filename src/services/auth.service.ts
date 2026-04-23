import bcrypt from "bcrypt";
import Redis from "ioredis";
import { IUserRepository } from "../repository/auth.repository";
import {
  CreateUserInputDTO,
  UserDTO,
  UserEntity,
  LoginDTO,
  AuthUser,
} from "../domain/auth.types";
import { AppError } from "../utils/AppError";
export interface IAuthService {
  register(data: CreateUserInputDTO): Promise<UserDTO>;
  validateUser(data: LoginDTO): Promise<AuthUser>;
  generateOrgId(): string;
  logout(userId: number): Promise<void>;
  revokeAllSessions(userId: number): Promise<void>;
  getTokenVersion(userId: number): Promise<number>;
  mapToDTO(user: UserEntity): UserDTO;
  getUserById(id: number): Promise<UserEntity | null>;
}

export const createAuthService = (
  userRepo: IUserRepository,
  redisClient: Redis,
): IAuthService => {
  const generateOrgId = (): string => {
    return "ORG_" + Math.random().toString(36).slice(2, 8).toUpperCase();
  };

  const mapToDTO = (user: UserEntity): UserDTO => ({
    id: user.id,
    username: user.username,
    email: user.email,
    orgid: user.orgid,
  });
  const getTokenVersion = async (userId: number): Promise<number> => {
    const version = await redisClient.get(`user:token_version:${userId}`);
    return version ? parseInt(version, 10) : 1; // Default je 1
  };
  return {
    generateOrgId,
    mapToDTO,
    getTokenVersion,
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

    async validateUser(data: LoginDTO): Promise<AuthUser> {
      const user = await userRepo.findByEmail(data.email);
      if (!user) throw new AppError("User not found", 401, "USER_NOT_FOUND");

      const ok = await bcrypt.compare(data.password, user.password);
      if (!ok)
        throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
      const tokenVersion = await getTokenVersion(user.id);
      return { ...user, tokenVersion };
    },
    async logout(userId: number) {
      await redisClient.incr(`user:token_version:${userId}`);
    },
    async revokeAllSessions(userId: number) {
      await redisClient.incr(`user:token_version:${userId}`);
    },
    async getUserById(id: number): Promise<UserEntity | null> {
      return await userRepo.findById(id);
    },
  };
};
