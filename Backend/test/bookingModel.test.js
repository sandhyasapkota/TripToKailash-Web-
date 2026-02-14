import SequelizeMock from "sequelize-mock";

const dbMock = new SequelizeMock();

const BookingMock = dbMock.define("Booking", {
  userId: 1,
  productId: 1,
  travelDate: "2024-01-01",
  numberOfPeople: 2,
  status: "Pending",
});

describe("Booking Model", () => {
  it("should create a new booking", async () => {
    const booking = await BookingMock.create({
      userId: 2,
      productId: 3,
      travelDate: "2024-02-01",
      numberOfPeople: 4,
      status: "Confirmed",
    });
    expect(booking.userId).toBe(2);
    expect(booking.productId).toBe(3);
    expect(booking.travelDate).toBe("2024-02-01");
    expect(booking.numberOfPeople).toBe(4);
    expect(booking.status).toBe("Confirmed");
  });
});