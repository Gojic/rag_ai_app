import { uploadDocumentValidators } from "../../../validators/documents.validators";
import { runValidators } from "../../utils/runValidators";
import db from "../../../db/models";
import { title } from "process";
import { Content } from "openai/resources/containers/files/content";
const { Collection } = db as any;

describe("uploadDocumentValidators (unit)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  /** COLLECTION ID TESTS */
  it("should error when collectionId is missing", async () => {
    const errors = await runValidators(uploadDocumentValidators, {
      title: "Doc title",
      content: "Some content",
    });
    expect(errors.some((e) => e.field === "collectionId")).toBe(true);
  });
  it("should error when collectionId is not positive integer", async () => {
    const errors = await runValidators(uploadDocumentValidators, {
      collectionId: -1,
      title: "Doc title",
      content: "Some content",
    });
    expect(errors.some((e) => e.field === "collectionId")).toBe(true);
  });

  it("should error when collection not found for user/org", async () => {
    jest.spyOn(Collection, "findOne").mockResolvedValue(null);
    const errors = await runValidators(
      uploadDocumentValidators,
      {
        collectionId: 999,
        title: "Doc title",
        content: "Some content",
      },
      {
        userId: 1,
        orgid: 2,
        file: { mimetype: "text/plain", size: 100 },
      }
    );
    expect(errors.some((e) => /collection not found/i.test(e.message))).toBe(
      true
    );
  });
  it("should pass when collection exists", async () => {
    jest.spyOn(Collection, "findOne").mockResolvedValue({ id: 1 });
    const errors = await runValidators(
      uploadDocumentValidators,
      {
        collectionId: 1,
        title: "Ok Title",
        content: "Ok content",
      },
      {
        userId: 1,
        orgid: 1,
        file: { mimetype: "text/plain", size: 100 },
      }
    );

    expect(errors.length).toBe(0);
  });
  /** TITLE TESTS */

  it.each<[string, any, string]>([
    ["missing title", { title: undefined }, "title"],
    ["too short", { title: "A" }, "title"],
    ["too long", { title: "x".repeat(256) }, "title"],
  ])("rejects when %s", async (_label, payload, field) => {
    const errors = await runValidators(uploadDocumentValidators, {
      collectionId: 1,
      content: "Ok content",
      ...payload,
      file: { mimetype: "text/plain", size: 10 },
    });
    expect(errors.some((e) => e.field === field)).toBe(true);
  });

  it.each<[string, any, string]>([
    ["missing content", { content: undefined }, "content"],
    ["empty content", { content: "" }, "content"],
  ])("rejects when %s", async (_label, payload, field) => {
    const errors = await runValidators(uploadDocumentValidators, {
      collectionId: 1,
      title: "Valid title",
      ...payload,
      file: { mimetype: "text/plain", size: 10 },
    });
    expect(errors.some((e) => e.field === field)).toBe(true);
  });

  it("should fail when file is missing", async () => {
    const errors = await runValidators(uploadDocumentValidators, {
      collectionId: 1,
      title: "Valid title",
      content: "Valid content",
    });
    expect(errors.some((e) => /file is required/i.test(e.message))).toBe(true);
  });

  it("should fail when file type is unsupported", async () => {
    const errors = await runValidators(
      uploadDocumentValidators,
      {
        collectionId: 1,
        title: "Ok Title",
        content: "Ok content",
      },
      {
        userId: 1,
        orgid: 1,
        file: { mimetype: "image/png", size: 100 },
      }
    );

    expect(errors.some((e) => /unsupported file type/i.test(e.message))).toBe(
      true
    );
  });

  it("should fail when file too large (>15MB)", async () => {
    const errors = await runValidators(
      uploadDocumentValidators,
      {
        collectionId: 1,
        title: "Ok Title",
        content: "Ok content",
      },
      {
        userId: 1,
        orgid: 1,
        file: { mimetype: "text/plain", size: 16 * 1024 * 1024 },
      }
    );

    expect(errors.some((e) => /file too large/i.test(e.message))).toBe(true);
  });

  it("should pass for valid file (txt)", async () => {
    jest.spyOn(Collection, "findOne").mockResolvedValue({ id: 1 });
    const errors = await runValidators(
      uploadDocumentValidators,
      {
        collectionId: 1,
        title: "Ok Title",
        content: "Ok content",
      },
      {
        userId: 1,
        orgid: 1,
        file: { mimetype: "text/plain", size: 100 },
      }
    );

    expect(errors.length).toBe(0);
  });
});
