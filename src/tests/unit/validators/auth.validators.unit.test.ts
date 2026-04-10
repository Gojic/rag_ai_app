import { createAuthService } from "../../../services/auth.service";
import { AppError } from "../../../utils/AppError";
import bcrypt from "bcrypt";

jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const makeRepo = (overrides = {}) => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockReturnValue(null),
  create: jest.fn(),
  ...overrides,
});

const fakeUser = {
  id: 1,
  username: "milos",
  email: "milos@test.com",
  password: "hashed_password",
  orgid: "ORG_ABC123",
};

describe("AuthService", () => {
  describe("register", () => {
    it("409 if user exists", async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(fakeUser),
      });
      const service = createAuthService(repo);

      await expect(
        service.register({
          username: "milos",
          email: "milos@test.com",
          password: "hashed_password",
        }),
      ).rejects.toMatchObject({ status: 409, code: "USER_EXISTS" });
    });
    it("creating a user and returns DTO wihout a password", async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(fakeUser),
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      const service = createAuthService(repo);
      const result = await service.register({
        username: "milos",
        email: "milos@test.com",
        password: "Password1!",
      });
      expect(result).toEqual({
        id: 1,
        username: "milos",
        email: "milos@test.com",
        orgid: "ORG_ABC123",
      });
      expect(result).not.toHaveProperty("password");
    });
    it("calling bcrypt.hash before user creation", async () => {
      const repo = makeRepo({
        create: jest.fn().mockResolvedValue(fakeUser),
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

      const service = createAuthService(repo);
      await service.register({
        username: "milos",
        email: "milos@test.com",
        password: "Password1!",
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("Password1!", 10);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: "hashed_password" }),
      );
    });
    it("generating orgid in ORG_XXXXX format", async () => {
      const repo = makeRepo({
        create: jest
          .fn()
          .mockImplementation((data) =>
            Promise.resolve({ ...fakeUser, orgid: data.orgid }),
          ),
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      const service = createAuthService(repo);
      const result = await service.register({
        username: "milos",
        email: "milos@test.com",
        password: "Password1!",
      });
      expect(result.orgid).toMatch(/^ORG_[A-Z0-9]{6}$/);
    });
  });
  describe("validateUser", () => {
    it(" 401 does not exist", async () => {
      const repo = makeRepo({ findByEmail: jest.fn().mockResolvedValue(null) });
      const service = createAuthService(repo);

      await expect(
        service.validateUser({
          email: "neko@test.com",
          password: "Password1!",
        }),
      ).rejects.toMatchObject({ status: 401, code: "USER_NOT_FOUND" });
    });

    it("401 if password is wrong", async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(fakeUser),
      });
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const service = createAuthService(repo);

      await expect(
        service.validateUser({
          email: "milos@test.com",
          password: "WrongPass1!",
        }),
      ).rejects.toMatchObject({ status: 401, code: "INVALID_CREDENTIALS" });
    });

    it("returns a user if credntials are ok", async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(fakeUser),
      });
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const service = createAuthService(repo);
      const result = await service.validateUser({
        email: "milos@test.com",
        password: "Password1!",
      });

      expect(result).toEqual(fakeUser);
    });
  });
});
