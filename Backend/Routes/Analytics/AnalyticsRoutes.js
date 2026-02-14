import express from 'express';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';
import { 
  getDashboardStats,
  getMonthlyRevenue,
  getCustomerStats
} from '../../Controller/Analytics/AnalyticsController.js';

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/dashboard', verifyToken, isAdmin, getDashboardStats);

// Get monthly revenue (admin only)
router.get('/revenue/monthly', verifyToken, isAdmin, getMonthlyRevenue);

// Get customer statistics (admin only)
router.get('/customers', verifyToken, isAdmin, getCustomerStats);

export { router as AnalyticsRoutes };
