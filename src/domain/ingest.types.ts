//Ovo dobija controller kada uploaduješ fajl.
export type CreateDocInputDTO = {
  orgid: string;
  collectionId: number;
  title: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string | null;
};

//Ovo predstavlja dokument kakav je upisan u bazu.
export type DocumentEntity = {
  id: number;
  title: string;
  content?: string | null;
  status: string;
  mimeType: string;
  size: number | null;
  path?: string | null;
  checksum?: string | null;
  orgid: string;
  collectionId: number | null;
  s3Key: string;
  s3Url?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentInstance = DocumentEntity & {
  update: (...args: any[]) => Promise<any>;
};

// Šta vraćaš frontendu — očišćeno od nepotrebnih polja
export type DocumentDTO = {
  id: number;
  title: string;
  mimeType: string;
  size: number;
  status: string;
  content?: string | null;
  orgid: string;
  s3Key: string;
  s3Url?: string | null;
};

//Preslikava tabela DocumentChunks
export type DocumentChunkEntity = {
  id: number;
  documentId: number;
  chunkIndex: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
};

//Šta servis ingestDocument() vraća.
export type IngestResult = {
  ok: boolean;
  chunks: number;
};

//Šta vraća ingestStatus controller.
export type IngestStatusDTO = {
  id: number;
  status: string;
};

// Šta šaljemo u Qdrant kao payload
export type QdrantChunkPayload = {
  orgid: string;
  collectionId: number | null;
  documentId: number;
  chunkIndex: number;
};

// Jedna tačka u Qdrant kolekciji
export type QdrantPoint = {
  id: number;
  vector: number[];
  payload: QdrantChunkPayload;
};

// Jedan rezultat iz Qdrant pretrage (search)
export type QdrantSearchHit = {
  id: number | string;
  score: number;
  payload: QdrantChunkPayload;
};

// Šta vraćamo frontendu kao "source" za odgovor
export type RAGSourceDTO = {
  documentId: number;
  chunkIndex: number;
  score: number;
  ref: string;
};

// Šta dolazi iz fronta u ragQuery endpoint
export type RAGQueryInputDTO = {
  collectionId: number;
  docId: number;
  question: string;
  topK?: number;
};

export type Chunk = {
  index: number;
  text: string;
};
