import request from "supertest";
import app from "../../app";

describe("Auth Endpoints", () => {
  it("should return 422 when email is invalid", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "not-an-email",
      password: "Password1",
      username: "usertest",
    });

    expect(res.status).toBe(422);
  });
});
