import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import * as routes from './Routes/index.js';
import { createRateLimiter } from './Middleware/rateLimit.js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Static uploads (product images, profile pictures, etc.)
app.use('/uploads', express.static(path.join(process.cwd(), '..', 'uploads')));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

// Rate limiting
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 120 }));

// Mount routes (support both /api/* and legacy root paths)
app.use('/api/users', routes.UserRoute);
app.use('/api/products', routes.ProductRoutes);
app.use('/api/bookings', routes.BookingRoutes);
app.use('/api/reviews', routes.ReviewRoutes);
app.use('/api/admin', routes.AdminRoutes);
app.use('/api/equipment-purchases', routes.EquipmentPurchaseRoutes);
app.use('/api/wishlist', routes.WishlistRoutes);
app.use('/api/analytics', routes.AnalyticsRoutes);
app.use('/api/contact', routes.ContactMessageRoutes);

app.use('/users', routes.UserRoute);
app.use('/products', routes.ProductRoutes);
app.use('/bookings', routes.BookingRoutes);
app.use('/reviews', routes.ReviewRoutes);
app.use('/admin', routes.AdminRoutes);
app.use('/equipment-purchases', routes.EquipmentPurchaseRoutes);
app.use('/wishlist', routes.WishlistRoutes);
app.use('/analytics', routes.AnalyticsRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

export default app;
