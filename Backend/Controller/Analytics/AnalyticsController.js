import { Booking, Product, User, Review } from '../../Model/index.js';
import { sequelize } from '../../Database/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.count();

    // Get total bookings
    const totalBookings = await Booking.count();

    // Get total revenue
    const bookings = await Booking.findAll({
      include: [{ model: Product, attributes: ['price'] }]
    });
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.Product?.price || 0), 0);

    // Get top 10 packages
    const topPackages = await Product.findAll({
      attributes: [
        'id',
        'name',
        'price',
        'category',
        [sequelize.fn('COUNT', sequelize.col('Bookings.id')), 'booking_count']
      ],
      include: [
        {
          model: Booking,
          attributes: [],
          through: { attributes: [] }
        }
      ],
      group: ['Product.id'],
      subQuery: false,
      limit: 10,
      order: [[sequelize.fn('COUNT', sequelize.col('Bookings.id')), 'DESC']],
      raw: true
    }).catch(() => []);

    // Get booking trends (last 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const bookingTrends = await Booking.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [sequelize.Op.gte]: last7Days }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Get average rating
    const reviews = await Review.findAll();
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2)
      : 0;

    res.status(200).json({
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalUsers,
        totalBookings,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        topPackages,
        bookingTrends,
        avgRating
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving dashboard stats',
      error: error.message
    });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const monthlyData = await Booking.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "created_at"')), 'month'],
        [sequelize.fn('SUM', sequelize.col('Bookings.amount')), 'revenue']
      ],
      group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "created_at"'))],
      order: [[sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "created_at"')), 'ASC']],
      raw: true
    }).catch(() => []);

    res.status(200).json({
      message: 'Monthly revenue retrieved successfully',
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving monthly revenue',
      error: error.message
    });
  }
};

export const getCustomerStats = async (req, res) => {
  try {
    // Get top customers
    const topCustomers = await User.findAll({
      attributes: [
        'id',
        'username',
        'email',
        [sequelize.fn('COUNT', sequelize.col('Bookings.id')), 'total_bookings']
      ],
      include: [
        {
          model: Booking,
          attributes: [],
          required: true
        }
      ],
      group: ['User.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Bookings.id')), 'DESC']],
      limit: 10,
      raw: true,
      subQuery: false
    }).catch(() => []);

    // Get new users this month
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newUsersThisMonth = await User.count({
      where: {
        created_at: { [sequelize.Op.gte]: thisMonth }
      }
    });

    res.status(200).json({
      message: 'Customer stats retrieved successfully',
      data: {
        topCustomers,
        newUsersThisMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving customer stats',
      error: error.message
    });
  }
};
