import { createDocumentService } from "../../../services/document.service";
const makeRepo = (overrides = {}) => ({
  findCollection: jest.fn().mockResolvedValue({ id: 1 }),
  findByS3Key: jest.fn().mockResolvedValue(null),
  createDocument: jest.fn().mockResolvedValue(fakeDocument),
  findById: jest.fn().mockResolvedValue(null),
  findByCollection: jest.fn().mockResolvedValue([]),
  ...overrides,
});
const fakeDocument = {
  id: 1,
  title: "Test Title",
  mimeType: "application/pdf",
  size: 67109,
  status: "DONE",
  content: "Test dummy Content",
  orgid: "ORG_ABC123",
  s3key: "uploads/11d1aee8-eca1-49da-8470.pdf",
  s3Url:
    "https://test.co/rag-documents-eu/uploads/11d1aee8-eca1-49da-8470-a2d46740b84a.pdf",
};
