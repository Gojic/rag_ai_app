import request from "supertest";
import app from "../../app";
import { sequelize } from "../../db/models";
let email: string;
beforeEach(async () => {
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  const models = sequelize.models;

  for (const modelName of Object.keys(models)) {
    await models[modelName].destroy({ where: {}, truncate: { cascade: true } });
  }
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

  email = `d${Date.now()}@test.com`;
});

describe("Auth Endpoints", () => {
  /*SIGNUP */

  it("should return 422 when email is invalid (smoke)", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "not-an-email",
      password: "Password1",
      username: "usertest",
    });

    expect(res.status).toBe(422);
  });
  it("Should return 422 incorect password policy (smoke)", async () => {
    const res = await request(app).post("/auth/signup").send({
      username: "usertest",
      email: "test1@gmail.com",
      password: "Pass",
    });
    expect(res.status).toBe(422);
  });
  it("Should return 201 if signup is ok", async () => {
    const res = await request(app).post("/auth/signup").send({
      username: "usertest",
      email: email,
      password: "Password1!",
    });
    console.log("email:", email);
    expect(res.status).toBe(201);
  });
  it("409/422 when email already exists", async () => {
    await request(app).post("/auth/signup").send({
      username: "User Test",
      email,
      password: "Password1!",
    });
    const res2 = await request(app).post("/auth/signup").send({
      username: "User Test",
      email,
      password: "Password1!",
    });

    expect([409, 422]).toContain(res2.status);
  });

  /** LOGIN */

  it("Should return 201 if login is ok", async () => {
    await request(app).post("/auth/signup").send({
      username: "User Test",
      email,
      password: "Password1!",
    });
    const res = await request(app).post("/auth/login").send({
      email: email,
      password: "Password1!",
    });

    expect(res.status).toBe(200);
  });
  it("Should return 401 if user not found (smoke)", async () => {
    const res = await request(app).post("/auth/login").send({
      email: email,
      password: "Password1!",
    });
    expect(res.status).toBe(401);
  });
});
