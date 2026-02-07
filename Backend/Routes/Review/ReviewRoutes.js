import express from 'express';
import { 
  getAllReviews, 
  getApprovedReviews,
  getUserReviews,
  createReview, 
  updateReviewStatus, 
  deleteReview 
} from '../../Controller/Review/ReviewController.js';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/approved', getApprovedReviews);

// Protected routes (require login)
router.post('/', verifyToken, createReview);
router.get('/user', verifyToken, getUserReviews); // ADD THIS LINE

// Admin routes
router.get('/', verifyToken, isAdmin, getAllReviews);
router.put('/:id', verifyToken, isAdmin, updateReviewStatus);
router.delete('/:id', verifyToken, isAdmin, deleteReview);

export { router as ReviewRoutes };