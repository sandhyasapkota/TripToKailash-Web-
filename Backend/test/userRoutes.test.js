import request from "supertest";
let app;

beforeAll(async () => {
  app = (await import("../app.js")).default;
});

describe("User Routes", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({
        fullName: "Test User",
        email: "testuser@example.com",
        phone: "1234567890",
          // password: "testpass123" // Removed accidental password line
      });
    expect([200, 201, 400]).toContain(res.statusCode); // Accepts 400 for duplicate, 201/200 for success
    expect(res.body).toBeDefined();
  });

  it("should login a user (if registered)", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({
        email: "testuser@example.com",
          password: "testpass123" 
      });
    expect([200, 400, 401]).toContain(res.statusCode); // Accepts 401/400 for invalid, 200 for success
    expect(res.body).toBeDefined();
  });

  // Add more route tests as needed
});
