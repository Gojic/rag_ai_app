import { createCollectionValidators } from "../../../validators/collection.validators";
import { runValidators } from "../../utils/runValidators";
import db from "../../../db/models";
const { Collection } = db as any;
describe("collectionValidators", () => {
  afterEach(() => jest.restoreAllMocks());

  it.each<[string, any, string]>([
    ["name required (empty/whitespace)", { name: " " }, "name"],
    ["name must be a string", { name: 123 }, "name"],
    ["name too short", { name: "n" }, "name"],
    ["name too long", { name: "x".repeat(101) }, "name"],
    [
      "description must be a string",
      { name: "Ok", description: 123 },
      "description",
    ],
    [
      "description too long",
      { name: "Ok", description: "x".repeat(501) },
      "description",
    ],
  ])("rejects when %s -error", async (_label, payload, field) => {
    const errors = await runValidators(createCollectionValidators, payload);
    expect(errors.some((e) => e.field === field)).toBe(true);
  });

  it("accept valid payload", async () => {
    const errors = await runValidators(createCollectionValidators, {
      name: "Some Valid Name",
      description: "Some valid Description",
    });
    expect(errors.length).toBe(0);
  });

  it("accepts when description is omitted", async () => {
    const errors = await runValidators(createCollectionValidators, {
      name: "Valid Name",
    });
    expect(errors.length).toBe(0);
  });
});
