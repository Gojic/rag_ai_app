import { AppError } from "../utils/AppError";
import { IDocumentRepository } from "../repository/document.repository";
import {
  CreateDocInputDTO,
  DocumentDTO,
  DocumentEntity,
} from "../domain/ingest.types";

export interface IDocumentService {
  createFromUpload(input: CreateDocInputDTO): Promise<DocumentDTO>;
  getDocumentFromBase(id: string): Promise<DocumentDTO | null>;
  getDocumentsFromCollection(collectionId: string): Promise<DocumentDTO[]>;
  mapToDTO(document: DocumentEntity): DocumentDTO;
}

export const createDocumentService = (
  docRepo: IDocumentRepository,
): IDocumentService => {
  const mapToDTO = (document: DocumentEntity): DocumentDTO => ({
    id: document.id,
    title: document.title,
    content: document.content,
    orgid: document.orgid,
    mimeType: document.mimeType,
    size: document.size ?? 0,
    status: document.status,
    s3Key: document.s3Key,
    s3Url: document.s3Url ?? null,
  });

  return {
    mapToDTO,

    async createFromUpload(input: CreateDocInputDTO): Promise<DocumentDTO> {
      if (!input.collectionId)
        throw new AppError(
          "CollectionId must be passed",
          400,
          "COLLECTIONID_REQUIRED",
        );
      if (!input.orgid) throw new AppError("Unauthorized", 400, "NO_ORG");

      const col = await docRepo.findCollection(input.collectionId, input.orgid);
      if (!col) {
        throw new AppError(
          "Collection not found for this org",
          400,
          "NO_COLLECTION",
        );
      }

      const existing = await docRepo.findByS3Key(input.orgid, input.s3Key);
      if (existing) return mapToDTO(existing);

      const created = await docRepo.createDocument(input);
      return mapToDTO(created);
    },

    async getDocumentFromBase(id: string): Promise<DocumentDTO | null> {
      if (!id) throw new AppError("DocId must be passed", 400, "NO_DOC_ID");

      const doc = await docRepo.findById(id);
      return doc ? mapToDTO(doc) : null;
    },

    async getDocumentsFromCollection(
      collectionId: string,
    ): Promise<DocumentDTO[]> {
      if (!collectionId)
        throw new AppError("CollectionId must be passed", 400, "NO_COL_ID");

      const documents = await docRepo.findByCollection(collectionId);
      return documents.map(mapToDTO);
    },
  };
};
