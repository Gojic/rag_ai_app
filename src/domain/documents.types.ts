export type CreateCollectionInputDTO = {
  name: string;
  description?: string;
};

export type CreateCollectionDTO = CreateCollectionInputDTO & {
  orgid: string;
  userId: number;
};

export type CollectionDTO = {
  id: number;
  name: string;
  description?: string;
  orgid: string;
};

export type CollectionEntity = {
  id: number;
  name: string;
  description?: string;
  orgid: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDocInputDTO = {
  orgid: string;
  collectionId: number;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string | null;
};
