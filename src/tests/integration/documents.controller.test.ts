/*import request from "supertest";
import app from "../../app";
import { sequelize } from "../../db/models";
let token: string;
let collectionId: number;

async function createCollection(tkn: string) {
  const res = await request(app)
    .post("/collections/create")
    .set("Authorization", `Bearer ${tkn}`)
    .send({
      name: "My Test Collection",
      description: "For docs upload",
    });

  return res.body.collection.id as number;
}

beforeEach(async () => {
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  const models = sequelize.models;

  for (const modelName of Object.keys(models)) {
    await models[modelName].destroy({ where: {}, truncate: { cascade: true } });
  }

  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

  const email = `u${Date.now()}@test.com`;
  await request(app).post("/auth/signup").send({
    username: "User Test",
    email,
    password: "Password1!",
  });

  const loginRes = await request(app).post("/auth/login").send({
    email,
    password: "Password1!",
  });

  token = loginRes.body.token;
  collectionId = await createCollection(token);
});
describe("Documents endpoints (Integrations)", () => {
  it("It should return 201 if request is ok", async () => {
    const res = await request(app)
      .post("/documents/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("collectionId", String(collectionId))
      .field("title", "Sample TXT")
      .field("content", "Short description")
      .attach("file", Buffer.from("hello world"), {
        filename: "sample.txt",
        contentType: "text/plain",
      });

    expect([200, 201]).toContain(res.status);

    expect(typeof res.body?.document?.id).toBe("number");
  });

  it("Should return 422 if file missing", async () => {
    const res = await request(app)
      .post("/documents/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("collectionId", String(collectionId))
      .field("title", "Sample TXT")
      .field("content", "Short description");
    expect(res.status).toBe(422);
  });

  it("Should return 200 if get download document is ok", async () => {
    const uploadRes = await request(app)
      .post("/documents/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("collectionId", String(collectionId))
      .field("title", "Will Download")
      .field("content", "Download URL flow")
      .attach("file", Buffer.from("hello again"), {
        filename: "file.txt",
        contentType: "text/plain",
      });

    expect([200, 201]).toContain(uploadRes.status);
    const docId = uploadRes.body?.document?.id;
    expect(typeof docId).toBe("number");

    const urlRes = await request(app)
      .get(`/documents/${docId}/download-url`)
      .set("Authorization", `Bearer ${token}`)
      .buffer(true)
      .parse((res, cb) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => cb(null, Buffer.concat(chunks)));
      });

    expect(urlRes.status).toBe(200);
    expect(Buffer.isBuffer(urlRes.body)).toBe(true);
    expect(urlRes.body.toString()).toBe("hello again");
  });

  it("Should 422 when collectionId does not belong to user/org", async () => {
    const res = await request(app)
      .post("/documents/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("collectionId", "999999")
      .field("title", "Wrong Collection")
      .field("content", "Should fail")
      .attach("file", Buffer.from("hi"), {
        filename: "a.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(422);
  });
});
*/
