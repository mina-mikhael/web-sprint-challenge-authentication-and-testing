// Write your tests here
const server = require("../api/server");
const request = require("supertest");
const db = require("../data/dbConfig");

const user0 = {
  username: "user0",
  password: "1234",
};
const user1 = {
  username: "user1",
  password: "1234",
};
const userMissingName = {
  username: "  ",
  password: "1234",
};

const userMissingPassword = {
  username: "userX",
  password: "",
};

test("sanity", () => {
  expect(true).toBe(true);
});

test("check environment", () => {
  expect(process.env.NODE_ENV).toBe("testing");
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
  await request(server).post("/api/auth/register").send({
    username: "user0",
    password: "1234",
  });
});

afterAll(async () => {
  await db.destroy();
});

describe("AUTH END POINT", () => {
  describe("CAN REGISTER A NEW USER PROPERLY", () => {
    test("can successfully register a new user", async () => {
      let result = await request(server).post("/api/auth/register").send(user1);
      expect(result.status).toBe(201);
      expect(result.body).toMatchObject({ username: "user1" });
      expect(result.body).toHaveProperty("id" && "password" && "username");
    });

    test("reject to register a username exist in the database", async () => {
      let result = await request(server).post("/api/auth/register").send(user0);
      expect(result.status).toBe(422);
      expect(result.body).toMatchObject({ message: "username taken" });
      expect(result.body).not.toHaveProperty("id" && "password" && "username");
    });

    test("can not register user if missing username or password", async () => {
      let result = await request(server).post("/api/auth/register").send(userMissingName);
      expect(result.status).toBe(400);
      expect(result.body).toMatchObject({ message: "username and password required" });
      result = await request(server).post("/api/auth/register").send(userMissingPassword);
      expect(result.status).toBe(400);
      expect(result.body).toMatchObject({ message: "username and password required" });
    });
    ///////
  });

  describe("CAN Login A USER PROPERLY", () => {
    test("can successfully login an existing user", async () => {
      let result = await request(server).post("/api/auth/login").send(user0);
      expect(result.status).toBe(200);
      expect(result.body).toMatchObject({ message: `welcome, ${user0.username}` });
      expect(result.body.token).toBeTruthy();
    });

    test("doesn't allow to login if username is not in the database", async () => {
      let result = await request(server).post("/api/auth/login").send(user1);
      expect(result.status).toBe(401);
      expect(result.body).toMatchObject({ message: "invalid credentials" });
      expect(result.body).not.toHaveProperty("username");
    });

    test("doesn't allow to login if missing username or password", async () => {
      let result = await request(server).post("/api/auth/login").send(userMissingName);
      expect(result.status).toBe(400);
      expect(result.body).toMatchObject({ message: "username and password required" });
      expect(result.body).not.toHaveProperty("username");
    });
  });
});
