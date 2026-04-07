/*import request from "supertest";
import app from "../../app";
import { sequelize } from "../../db/models";
let token: string;

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
});

describe("Collection endpoints (Integration)", () => {
  it("It should return 201 if request is ok", async () => {
    const res = await request(app)
      .post("/collections/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection name",
        description: "Collection description",
      });

    expect(res.status).toBe(201);
  });
  it("It should return 401 if wrong user", async () => {
    const res = await request(app).post("/collections/create").send({
      name: "Password1!",
      description: "Collection description",
    });
    expect(res.status).toBe(401);
  });
  it("should return 200 and a list of collections", async () => {
    const res = await request(app)
      .get("/collections/")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
*/
