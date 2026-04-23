export type UserDTO = {
  id: number;
  username: string;
  email: string;
  orgid: string;
};

export type CreateUserInputDTO = {
  username: string;
  email: string;
  password: string;
};
export type CreateUserDTO = CreateUserInputDTO & {
  orgid: string;
};
export type LoginDTO = {
  email: string;
  password: string;
};

export type JwtPayload = {
  userId: number;
  orgid: string;
  tokenVersion: number;
};
export type UserEntity = {
  id: number;
  username: string;
  email: string;
  password: string;
  orgid: string;
};

export type RefreshTokenPayload = {
  userId: number;
  tokenVersion: number;
  iat?: number;
  exp?: number;
};

export type AuthUser = UserEntity & {
  tokenVersion: number;
};
