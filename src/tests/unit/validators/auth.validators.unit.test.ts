import { createAuthService } from "../../../services/auth.service";
import bcrypt from "bcrypt";

jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const makeRedis = (overrides = {}) => ({
  get: jest.fn().mockResolvedValue(null),
  incr: jest.fn().mockResolvedValue(1),
  ...overrides,
});
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
  const setup = (repoOverrides = {}, redisOverrides = {}) => {
    const repo = makeRepo(repoOverrides);
    const redis = makeRedis(redisOverrides);
    const service = createAuthService(repo as any, redis as any);
    return { service, repo, redis };
  };
  describe("register", () => {
    it("409 if user exists", async () => {
      const { service } = setup({
        findByEmail: jest.fn().mockResolvedValue(fakeUser),
      });

      await expect(
        service.register({
          username: "milos",
          email: "milos@test.com",
          password: "hashed_password",
        }),
      ).rejects.toMatchObject({ status: 409, code: "USER_EXISTS" });
    });
    it("creating a user and returns DTO wihout a password", async () => {
      const { service } = setup({
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(fakeUser),
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
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
      const { service, repo } = setup({
        create: jest.fn().mockResolvedValue(fakeUser),
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

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
      const { service } = setup({
        create: jest
          .fn()
          .mockImplementation((data) =>
            Promise.resolve({ ...fakeUser, orgid: data.orgid }),
          ),
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed");
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
      const { service } = setup({
        findByEmail: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.validateUser({
          email: "neko@test.com",
          password: "Password1!",
        }),
      ).rejects.toMatchObject({ status: 401, code: "USER_NOT_FOUND" });
    });

    it("401 if password is wrong", async () => {
      const { service } = setup({
        findByEmail: jest.fn().mockResolvedValue(fakeUser),
      });
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser({
          email: "milos@test.com",
          password: "WrongPass1!",
        }),
      ).rejects.toMatchObject({ status: 401, code: "INVALID_CREDENTIALS" });
    });

    it("returns user with tokenVersion if credentials are ok", async () => {
      const { service } = setup(
        {
          findByEmail: jest.fn().mockResolvedValue(fakeUser),
        },
        {
          get: jest.fn().mockResolvedValue("1"), // tokenVersion u Redisu
        },
      );
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser({
        email: "milos@test.com",
        password: "Password1!",
      });

      expect(result).toMatchObject({
        id: 1,
        username: "milos",
        email: "milos@test.com",
        orgid: "ORG_ABC123",
        tokenVersion: 1, // sada vraca i tokenVersion!
      });
    });
  });
  describe("logout", () => {
    it("increments token version on logout", async () => {
      const { service, redis } = setup();

      await service.logout(1);

      expect(redis.incr).toHaveBeenCalledWith("user:token_version:1");
    });
  });

  describe("revokeAllSessions", () => {
    it("increments token version on revoke all", async () => {
      const { service, redis } = setup();

      await service.revokeAllSessions(1);

      expect(redis.incr).toHaveBeenCalledWith("user:token_version:1");
    });
  });
});
