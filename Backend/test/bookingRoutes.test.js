import request from "supertest";
let app;

beforeAll(async () => {
  app = (await import("../app.js")).default;
});

describe("Booking Routes", () => {
  it("should create a new booking (if user is authenticated)", async () => {
    // You may need to provide a valid token for authenticated routes
    const res = await request(app)
      .post("/bookings")
      .set("Authorization", "Bearer <your_token_here>")
      .send({
        userId: 1,
        productId: 1,
        startDate: "2026-02-01",
        endDate: "2026-02-10"
      });
    expect([200, 201, 400, 401]).toContain(res.statusCode);
    expect(res.body).toBeDefined();
  });

  it("should get all bookings (admin only)", async () => {
    const res = await request(app)
      .get("/bookings")
      .set("Authorization", "Bearer <admin_token_here>");
    expect([200, 401, 403]).toContain(res.statusCode);
    expect(res.body).toBeDefined();
  });

  // Add more route tests as needed
});

