import db from "../db/models";
import { AppError } from "../utils/AppError";
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

  if (!input.collectionId)
    throw new AppError(
      "CollectionId must be passed",
      400,
      "COLLECTIONID_REQUIRED"
    );
  if (!input.orgid) throw new AppError("Unauthorized", 400, "NO_ORG");
  const col = await Collection.findOne({
    where: {
      id: input.collectionId,
      orgid: input.orgid,
    },
  });

  if (!col) {
    throw new AppError(
      "Collection not found for this org",
      400,
      "NO_COLLECTION"
    );
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

/*export async function markIngestStatus(
  documentId: string,
  status: "RUNNING" | "DONE" | "FAILED",
  error?: string
) {
  const { Document } = db as any;
  return Document.update(
    { status, ...(error ? { error } : {}) },
    { where: { id: documentId } }
  );
} */
export async function getDocumentFromBase(id: string) {
  const { Document } = db as any;
  if (!id) {
    throw new AppError("DocId must be passed", 400, "NO_DOC_ID");
  }
  return await Document.findByPk(id);
}
