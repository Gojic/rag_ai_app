import db from "../db/models";

type CreateDocInput = {
  orgid: string;
  collectionId: number;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string | null;
};

export async function createFromUpload(input: CreateDocInput) {
  const { Document, Collection } = db as any;
  if (!input.collectionId) {
    throw new Error("collectionId is rquried");
  }

  const col = await Collection.findOne({
    where: {
      id: input.collectionId,
      orgid: input.orgid,
    },
  });

  if (!col) {
    throw new Error("Collection not found for this org");
  }
  const existing = await Document.findOne({
    where: {
      orgid: input.orgid,
      s3key: input.s3Key,
    },
  });
  if (existing) return existing;

  return Document.create({
    ...input,
    status: "PENDING",
  });
}

export async function markIngestStatus(
  documentId: string,
  status: "RUNNING" | "DONE" | "FAILED",
  error?: string
) {
  const { Document } = db as any;
  return Document.update(
    { status, ...(error ? { error } : {}) },
    { where: { id: documentId } }
  );
}
