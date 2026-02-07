import express from 'express';
import { verifyToken } from '../../Middleware/authMiddleware.js';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  checkInWishlist 
} from '../../Controller/Wishlist/WishlistController.js';

const router = express.Router();

// Get user's wishlist
router.get('/', verifyToken, getWishlist);

// Add to wishlist
router.post('/', verifyToken, addToWishlist);

// Remove from wishlist
router.delete('/:product_id', verifyToken, removeFromWishlist);

// Check if product in wishlist
router.get('/check/:product_id', verifyToken, checkInWishlist);

export default router;
