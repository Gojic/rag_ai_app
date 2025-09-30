import db from "../db/models";

type CreateCollectionInput = {
  name: string;
  description?: string;
  orgid: string;
};
export async function createCollection(input: CreateCollectionInput) {
  const { Collection } = db as any;

  if (!input.orgid) {
    throw new Error("orgid is required");
  }
  if (!input.name) {
    throw new Error("name is required");
  }
  const existing = await Collection.findOne({
    where: {
      name: input.name,
      orgid: input.orgid,
    },
  });
  if (existing) return existing;

  return Collection.create({
    ...input,
  });
}

export async function getCollection(inputOrgId: string) {
  const { Collection } = db as any;
  if (!inputOrgId) {
    throw new Error("orgId must be passed");
  }
  console.log("orgid: ", inputOrgId);
  return await Collection.findAll({
    where: { orgid: inputOrgId },
  });
}
