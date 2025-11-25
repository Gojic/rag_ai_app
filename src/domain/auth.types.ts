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
};
export type UserEntity = {
  id: number;
  username: string;
  email: string;
  password: string;
  orgid: string;
};
