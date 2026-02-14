import request from 'supertest';
import app from '../app.js';
import { sequelize } from '../Database/db.js';
import { Booking } from '../Model/Booking/BookingModel.js';
import { Product } from '../Model/Product/productModel.js';
import { User } from '../Model/User/UserModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

describe("Booking Controller", () => {
  let token;
  let user;
  let product;

  beforeAll(async () => {
    // Sync database and create test user and product
    await sequelize.sync({ force: true });
    user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password',
      role: 'user',
      isEmailVerified: true
    });
    product = await Product.create({
      name: 'Test Package',
      price: 1000,
      stock_quantity: 10,
      status: 'active',
      category: 'Adventure'
    });
    // Generate a real JWT token for the user
    token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-12345', { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new booking', async () => {
    const bookingData = {
      productId: product.id,
      travelDate: '2099-12-31',
      numberOfPeople: 2,
      specialRequests: 'Window seat',
      userId: user.id
    };
    // Mock verifyToken middleware or set up app to skip auth in test
    const response = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingData);
    expect(response.status).toBe(201);
    expect(response.body.booking).toBeDefined();
    expect(response.body.booking.productId).toBe(product.id);
    expect(response.body.booking.userId).toBe(user.id);
    expect(response.body.booking.numberOfPeople).toBe(2);
    expect(response.body.booking.status).toBe('Pending');
  });
});
