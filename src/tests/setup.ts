import db from "../db/models";

jest.mock("@qdrant/js-client-rest", () => {
  return {
    QdrantClient: function () {
      return {
        getCollections: jest.fn().mockResolvedValue({ collections: [] }),
        createCollection: jest.fn().mockResolvedValue(undefined),
        upsert: jest.fn().mockResolvedValue(undefined),
        search: jest.fn().mockResolvedValue([]),
      };
    },
  };
});

afterAll(async () => {
  try {
    const { sequelize } = db as any;
    await sequelize?.close();
  } catch {}
});
