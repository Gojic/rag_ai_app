import db from "../db/models";

type CreateDocInput = {
  orgid: string;
  collectionId?: string;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string | null;
};

export async function createFromUpload(input: CreateDocInput) {
  const { Document } = db as any; //
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
