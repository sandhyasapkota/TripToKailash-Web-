import { jest } from '@jest/globals';
import { getAllUsers, registerUser, loginUser } from "../Controller/User/UserController.js";
import { User } from "../Model/User/UserModel.js";

// Mock Express req/res
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Controller", () => {
  it("should fetch all users", async () => {
    // Arrange
    const users = [{ id: 1, username: "Test", email: "test@example.com" }];
    jest.spyOn(User, "findAll").mockResolvedValue(users);
    const req = { query: {} };
    const res = mockResponse();
    // Act
    await getAllUsers(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: users, message: "Users fetched successfully" }));
  });

  // Add more tests for registerUser, loginUser, etc. as needed
});