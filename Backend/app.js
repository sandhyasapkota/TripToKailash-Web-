import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import * as routes from './Routes/index.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/users', routes.UserRoute);
app.use('/products', routes.ProductRoutes);
app.use('/bookings', routes.BookingRoutes);
app.use('/reviews', routes.ReviewRoutes);
app.use('/admin', routes.AdminRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

export default app;
