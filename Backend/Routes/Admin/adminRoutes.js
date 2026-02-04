import express from 'express';
import { Op } from 'sequelize';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';
import { getAllUsers, getUserById, updateUserById, deleteUserById } from '../../Controller/User/UserController.js';
import { User, Review, Product, Booking } from '../../Model/index.js';
import bcrypt from 'bcrypt';
import { sequelize } from '../../Database/db.js';

const router = express.Router();

// Special route to create first admin (remove after creating admin)
router.post('/create-admin', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    res.status(201).json({ 
      message: 'Admin created successfully',
      admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);
router.delete('/users/:id', deleteUserById);

// Dashboard stats - Updated to get real counts
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalPackages = await Product.count({ where: { category: { [Op.ne]: 'Equipment' } } });
    const totalEquipment = await Product.count({ where: { category: 'Equipment' } });
    const totalReviews = await Review.count();
    const pendingReviews = await Review.count({ where: { status: 'Pending' } });
    const totalBookings = await Booking.count();
    
    // Booking status breakdown
    const pendingBookings = await Booking.count({ where: { status: 'Pending' } });
    const confirmedBookings = await Booking.count({ where: { status: 'Confirmed' } });
    const cancelledBookings = await Booking.count({ where: { status: 'Cancelled' } });
    const completedBookings = await Booking.count({ where: { status: 'Completed' } });
    
    const totalRevenueResult = await Booking.findAll({ attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'totalRevenue']] });
    const totalRevenue = totalRevenueResult[0]?.get('totalRevenue') || 0;

    // Recent bookings - using stored userName and packageName fields
    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'userName', 'userEmail', 'packageName', 'price', 'status', 'travelDate', 'createdAt']
    });

    // Recent users
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'username', 'email', 'createdAt']
    });

    // Get monthly data for the last 6 months
    const monthlyStats = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);
      
      const monthBookings = await Booking.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      const monthRevenueResult = await Booking.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'revenue']],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      const monthRevenue = parseFloat(monthRevenueResult[0]?.get('revenue') || 0);
      
      const monthUsers = await User.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyStats.push({
        month: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`,
        bookings: monthBookings,
        revenue: monthRevenue,
        users: monthUsers
      });
    }

    res.status(200).json({
      totalUsers: totalUsers,
      totalBookings: totalBookings,
      totalPackages: totalPackages,
      totalEquipment: totalEquipment,
      totalReviews: totalReviews,
      pendingReviews: pendingReviews,
      totalRevenue: totalRevenue,
      bookingStats: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        completed: completedBookings
      },
      recentBookings: recentBookings,
      recentUsers: recentUsers,
      monthlyStats: monthlyStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export const AdminRoutes = router;