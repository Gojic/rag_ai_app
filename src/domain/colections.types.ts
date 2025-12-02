// ************************************
// DTO TIPOVI ZA KOLEKCIJE I DOKUMENTE
// ************************************

// Input DTO → ono što klijent šalje u request body
// SAMO podaci koji dolaze iz frontenda
export type CreateCollectionInputDTO = {
  name: string;
  description?: string;
};

// Internal/Service DTO → pun objekat koji servis koristi
// Dodajemo vrednosti koje backend zna (orgid, userId)
export type CreateCollectionDTO = CreateCollectionInputDTO & {
  orgid: string;
  userId: number;
};

// Output/Response DTO → ono što vraćamo frontendu
// Sigurni podaci (bez userId, bez createdAt)
export type CollectionDTO = {
  id: number;
  name: string;
  description?: string;
  orgid: string;
};

// Entity → kako izgleda zapis u bazi / ORM model
// Ovo je “stvarna” struktura Sequelize modela
export type CollectionEntity = {
  id: number;
  name: string;
  description?: string;
  orgid: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

// Input DTO za kreiranje dokumenta
// Klijent šalje sve ove vrednosti kada upload-uje fajl
export type CreateDocInputDTO = {
  orgid: string;
  collectionId: number;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string | null;
};
