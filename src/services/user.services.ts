import db from "../db/models";

export async function getUserbyId(id: number) {
  const { User } = db as any;

  return await User.findByPk(id);
}

export async function getUser(email: string) {
  const { User } = db as any;
  return await User.findOne({ where: { email } });
}

export async function createUser(
  username: string,
  email: string,
  password: string,
  orgid: string
) {
  const { User } = db as any;
  return await User.create({
    username,
    email,
    password,
    orgid,
  });
}
export function genOrgId() {
  return "ORG_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
