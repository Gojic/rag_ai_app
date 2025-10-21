import {
  registerValidators,
  loginValidators,
} from "../../../validators/auth.validators";
import { runValidators } from "../../utils/runValidators";
import db from "../../../db/models";
const { User } = db as any;

describe("authValidators (unit)", () => {
  beforeEach(() => jest.spyOn(User, "findOne").mockResolvedValue(null));

  afterEach(() => jest.restoreAllMocks());

  /* SIGNUP */

  it.each<[string, string]>([
    ["too short", "P1a"],
    ["no uppercase", "password1"],
    ["no lowercase", "PASSWORD1"],
    ["no digit", "Password!"],
  ])("rejects when %s -error", async (_label, pwd) => {
    const errors = await runValidators(registerValidators, {
      email: "ok@test.com",
      password: pwd,
      username: "User Test",
    });
    expect(errors.some((e) => e.field === "password")).toBe(true);
  });

  it("accepts valid password - no error", async () => {
    const errors = await runValidators(registerValidators, {
      email: "ok@test.com",
      password: "Password1",
      username: "User Test",
    });
    expect(errors.length).toBe(0);
  });

  it("invalid email - error", async () => {
    const spy = jest.spyOn(User, "findOne").mockResolvedValue(null);
    const errors = await runValidators(registerValidators, {
      email: "bad",
      password: "Password1!",
      username: "User Test",
    });

    expect(errors.some((e: { field: string }) => e.field === "email")).toBe(
      true
    );

    expect(spy).not.toHaveBeenCalled();
  });
  it("duplicate email - error", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({ id: 1 });
    const errors = await runValidators(registerValidators, {
      email: "ok@test.com",
      password: "Password1",
      username: "User Test",
    });
    expect(errors.some((e) => /already in use/i.test(e.message))).toBe(true);
  });

  it("valid & not existing - no errors", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const errors = await runValidators(registerValidators, {
      email: "ok@test.com",
      password: "Password1",
      username: "User Test",
    });
    expect(errors.length).toBe(0);
  });

  it.each<[string, any]>([
    ["blank", " "],
    ["too short", "12345"],
  ])("invalid username -error", async (_label, pwd) => {
    const errors = await runValidators(registerValidators, {
      email: "ok@test.com",
      password: "Password1",
      username: pwd,
    });

    expect(errors.some((e) => e.field === "username")).toBe(true);
  });
  /* LOGIN */

  it("Invalid email -error", async () => {
    const errors = await runValidators(loginValidators, {
      password: "MojaSifra1!",
      email: "testgmail.com",
    });
    expect(errors.some((e) => e.field === "email")).toBe(true);
  });

  test.each([
    ["password required", " ", "password"],
    ["too short", "12345", "password"],
  ])("wrong password credentials", async (_label, pwd) => {
    const errors = await runValidators(loginValidators, {
      password: pwd,
      email: "ok@test.com",
    });
    expect(errors.some((e) => e.field === "password")).toBe(true);
  });
});
