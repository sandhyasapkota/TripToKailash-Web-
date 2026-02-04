import { Review } from '../../Model/index.js';
import { User } from '../../Model/index.js';
import { Product } from '../../Model/index.js';
import { Booking } from '../../Model/index.js';
import { parsePagination, paginateArray } from '../../Utils/pagination.js';

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const { status, userId, productId } = req.query;
    const { page, limit } = parsePagination(req.query);
    const reviews = await Review.findAll({
      order: [['createdAt', 'DESC']]
    });

    let filtered = reviews;
    if (status) {
      filtered = filtered.filter((review) => review.status === status);
    }
    if (userId) {
      filtered = filtered.filter((review) => String(review.userId) === String(userId));
    }
    if (productId) {
      filtered = filtered.filter((review) => String(review.packageId) === String(productId));
    }

    const { items, meta } = paginateArray(filtered, page, limit);
    res.status(200).json({ data: items, message: "Reviews fetched successfully", meta });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get approved reviews only (for public display)
const getApprovedReviews = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const reviews = await Review.findAll({
      where: { status: 'Approved' },
      order: [['createdAt', 'DESC']]
    });

    const { items, meta } = paginateArray(reviews, page, limit);
    res.status(200).json({ data: items, message: "Approved reviews fetched successfully", meta });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get reviews by user ID
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { page, limit } = parsePagination(req.query);
    const reviews = await Review.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    const { items, meta } = paginateArray(reviews, page, limit);
    res.status(200).json({ data: items, message: "User reviews fetched successfully", meta });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
};

// Create new review
const createReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, title, comment } = req.body;
    const currentUserId = req.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (user_id && parseInt(user_id) !== currentUserId) {
      return res.status(403).json({ error: "You can only review with your own account" });
    }

    if (!product_id || !rating || !title || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate rating (1-5)
    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Validate title length
    if (title.trim().length < 5) {
      return res.status(400).json({ error: "Title must be at least 5 characters" });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ error: "Title must be less than 100 characters" });
    }

    // Validate comment length
    if (comment.trim().length < 20) {
      return res.status(400).json({ error: "Comment must be at least 20 characters" });
    }
    if (comment.trim().length > 1000) {
      return res.status(400).json({ error: "Comment must be less than 1000 characters" });
    }

    // Get user and product details
    const user = await User.findByPk(currentUserId);
    const product = await Product.findByPk(product_id);

    if (!user || !product) {
      return res.status(404).json({ error: "User or Product not found" });
    }

    const bookings = await Booking.findAll({
      where: { userId: currentUserId, productId: product_id }
    });

    const hasVerifiedBooking = bookings.some((booking) => {
      return booking.status === 'Confirmed' || booking.status === 'Completed';
    });

    if (!hasVerifiedBooking) {
      return res.status(403).json({ error: "Only users with a confirmed booking can review this package" });
    }

    const newReview = await Review.create({
      userId: currentUserId,
      userName: user.username,
      packageId: product_id,
      packageName: product.name,
      rating,
      title,
      comment,
      status: 'Pending'
    });

    res.status(201).json({ 
      data: newReview, 
      verifiedBooking: true,
      message: "Review submitted successfully. It will be visible after admin approval." 
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: "Failed to create review" });
  }
};

// Update review status (Admin only)
const updateReviewStatus = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    await review.update({ status });
    res.status(200).json({ data: review, message: "Review status updated successfully" });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findByPk(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    await review.destroy();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// Get review by ID
const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(200).json({ data: review, message: "Review fetched successfully" });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
};

// Alias for updateReviewStatus
const updateReviewById = updateReviewStatus;
// Alias for deleteReview
const deleteReviewById = deleteReview;
// Get reviews by product ID
const getReviewsByProductId = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { page, limit } = parsePagination(req.query);
    const reviews = await Review.findAll({
      where: { packageId: productId },
      order: [['createdAt', 'DESC']]
    });
    const { items, meta } = paginateArray(reviews, page, limit);
    res.status(200).json({ data: items, message: "Reviews for product fetched successfully", meta });
  } catch (error) {
    console.error('Get reviews by product ID error:', error);
    res.status(500).json({ error: "Failed to fetch reviews for product" });
  }
};

export {
  getAllReviews,
  getApprovedReviews,
  getUserReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
  getReviewById,
  updateReviewById,
  deleteReviewById,
  getReviewsByProductId
};
