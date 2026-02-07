import express from 'express';
import { createBooking, getAllBookings, getUserBookings, updateBookingStatus, deleteBooking, checkAvailability, cancelBookingByUser, rescheduleBookingByUser } from '../../Controller/Booking/BookingController.js';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';



const router = express.Router();

// User routes (require login)
router.get('/availability', checkAvailability);
router.post('/', verifyToken, createBooking);
router.get('/user', verifyToken, getUserBookings);
router.put('/:id/cancel', verifyToken, cancelBookingByUser);
router.put('/:id/reschedule', verifyToken, rescheduleBookingByUser);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllBookings);
router.put('/:id', verifyToken, isAdmin, updateBookingStatus);
router.delete('/:id', verifyToken, isAdmin, deleteBooking);

export { router as BookingRoutes };
