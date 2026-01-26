import { Review } from '../../Model/index.js';
import { User } from '../../Model/index.js';
import { Product } from '../../Model/index.js';

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: reviews, message: "Reviews fetched successfully" });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get approved reviews only (for public display)
const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { status: 'Approved' },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: reviews, message: "Approved reviews fetched successfully" });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get reviews by user ID
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const reviews = await Review.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: reviews, message: "User reviews fetched successfully" });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
};

// Create new review
const createReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, title, comment } = req.body;
    
    if (!user_id || !product_id || !rating || !title || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get user and product details
    const user = await User.findByPk(user_id);
    const product = await Product.findByPk(product_id);

    if (!user || !product) {
      return res.status(404).json({ error: "User or Product not found" });
    }

    const newReview = await Review.create({
      userId: user_id,
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
    const reviews = await Review.findAll({
      where: { packageId: productId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: reviews, message: "Reviews for product fetched successfully" });
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