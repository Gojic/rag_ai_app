import db from "../db/models";
import { AppError } from "../utils/AppError";
import {
  CreateDocInputDTO,
  DocumentEntity,
  DocumentDTO,
} from "../domain/ingest.types";

export async function createFromUpload(
  input: CreateDocInputDTO
): Promise<DocumentDTO> {
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
      s3Key: input.s3Key,
    },
  });
  if (existing) return mapDocumentToDTO(existing as DocumentEntity);

  const created = (await Document.create({
    ...input,
    status: "PENDING",
  })) as DocumentEntity;

  return mapDocumentToDTO(created);
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
export async function getDocumentFromBase(
  id: string
): Promise<DocumentDTO | null> {
  const { Document } = db as any;
  if (!id) {
    throw new AppError("DocId must be passed", 400, "NO_DOC_ID");
  }
  const doc = (await Document.findByPk(id)) as DocumentEntity | null;
  if (!doc) {
    return null;
  }
  return mapDocumentToDTO(doc);
}
export function mapDocumentToDTO(document: DocumentEntity): DocumentDTO {
  return {
    id: document.id,
    title: document.title,
    content: document.content,
    orgid: document.orgid,
    mimeType: document.mimeType,
    size: document.size ?? 0,
    status: document.status,
    s3Key: document.s3Key,
    s3Url: document.s3Url ?? null,
  };
}
