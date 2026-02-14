import SequelizeMock from "sequelize-mock";

const dbMock = new SequelizeMock();

const UserMock = dbMock.define("User", {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  password: "hashedpassword",
  role: "user",
  status: "active",
});

describe("User Model", () => {
  it("should create a user with correct fields", async () => {
    const user = await UserMock.create({
      name: "Sample User",
      email: "sample@example.com",
      password: "samplepass",
      role: "admin",
      status: "active",
    });
    expect(user.name).toBe("Sample User");
    expect(user.email).toBe("sample@example.com");
    expect(user.role).toBe("admin");
    expect(user.status).toBe("active");
  });

  it("should update user details correctly", async () => {
    const user = await UserMock.create({ name: "Old Name", email: "old@example.com" });
    user.name = "New Name";
    await user.save();
    expect(user.name).toBe("New Name");
  });
});