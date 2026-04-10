import { createCollectionService } from "../../../services/collections.service";
const makeRepo = (overrides = {}) => ({
  createCollection: jest.fn(),
  getCollection: jest.fn().mockResolvedValue([]),
  ...overrides,
});
const fakeCollection = {
  id: 1,
  name: "Test kolekcija",
  description: "Opis",
  orgid: "ORG_ABC123",
  userId: 1,
};

describe("CollectionService", () => {
  describe("Create collection", () => {
    it("returns 400 if orgid is NULL", async () => {
      const repo = makeRepo();

      const service = createCollectionService(repo);

      await expect(
        service.createCollection({
          orgid: "",
          name: "Test kolekcija",
          description: "Opis",
          userId: 1,
        }),
      ).rejects.toMatchObject({ status: 400, code: "ORG_REQUIRED" });
    });
    it("returns 400 if userID is NULL", async () => {
      const repo = makeRepo();

      const service = createCollectionService(repo);

      await expect(
        service.createCollection({
          orgid: "ORG_ABC123",
          name: "Test kolekcija",
          description: "Opis",
          userId: 0,
        }),
      ).rejects.toMatchObject({ status: 400, code: "USER_REQUIRED" });
    });
    it("returns 400 if name is NULL", async () => {
      const repo = makeRepo();

      const service = createCollectionService(repo);

      await expect(
        service.createCollection({
          orgid: "ORG_ABC123",
          name: "",
          description: "Opis",
          userId: 1,
        }),
      ).rejects.toMatchObject({ status: 400, code: "NAME_REQUIRED" });
    });
  });
  it("create collections if everything is ok", async () => {
    const repo = makeRepo({
      createCollection: jest.fn().mockResolvedValue(fakeCollection),
    });
    const service = createCollectionService(repo);
    const result = await service.createCollection({
      orgid: "ORG_ABC123",
      name: "Opis",
      description: "Opis",
      userId: 1,
    });

    expect(result).toEqual({
      id: 1,
      name: "Test kolekcija",
      description: "Opis",
      orgid: "ORG_ABC123",
    });
  });
  describe("get collections", () => {
    it("returns 400 if userIr or orgid are null", async () => {
      const repo = makeRepo();
      const service = createCollectionService(repo);

      await expect(service.getCollection("", 1)).rejects.toMatchObject({
        status: 400,
        code: "ORG_AND_USER_REQURIED",
      });
    });
    it("returns all collections for user if everything is ok", async () => {
      const repo = makeRepo({
        getCollection: jest.fn().mockResolvedValue([fakeCollection]),
      });
      const service = createCollectionService(repo);
      const result = await service.getCollection("ORG_ABC123", 1);
      expect(result).toEqual([
        {
          id: 1,
          name: "Test kolekcija",
          description: "Opis",
          orgid: "ORG_ABC123",
        },
      ]);
    });
  });
});
