const request = require("supertest");
const app = require("../../app");
const { connect, disconnect } = require("../../services/mongo");

// Test fixture
describe("launches endpoint", () => {
  // callback will run once
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  describe("Test GET /launches", () => {
    // Test case
    test("It should respond with 200 success", async () => {
      // Actual test code

      // 1. takes app as an argument
      // 2. listen() on that
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  describe("Test POST /launches", () => {
    const testLaunch = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };

    const testLaunchWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const testLaunchWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "foo",
    };

    test("It should respond 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(testLaunch)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(testLaunch.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(testLaunchWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(testLaunchWithoutDate)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch properties",
      });
    });

    test("It should catch invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(testLaunchWithInvalidDate)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
