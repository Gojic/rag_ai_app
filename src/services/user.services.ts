import db from "../db/models";
import { CreateUserDTO, UserDTO, UserEntity } from "../domain/auth.types";
const { User } = db as any;
export async function getUserbyId(id: number): Promise<UserDTO | null> {
  const user = await User.findByPk(id);
  if (!user) return null;

  return mapUserToDTO(user);
}

export async function getUser(email: string): Promise<UserDTO | null> {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;

  return mapUserToDTO(user);
}

export async function createUser(data: CreateUserDTO): Promise<UserDTO> {
  const user = await User.create(data);

  return mapUserToDTO(user);
}
export function genOrgId(): string {
  return "ORG_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
export async function getUserForAuth(
  email: string
): Promise<UserEntity | null> {
  return User.findOne({ where: { email } }) as UserEntity | null;
}

export function mapUserToDTO(user: UserEntity): UserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    orgid: user.orgid,
  };
}
