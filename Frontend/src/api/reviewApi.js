// src/api/reviewApi.js
export const REVIEW_API_URL = import.meta.env.VITE_REVIEW_API_URL || 'http://localhost:5000/api/reviews';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Common fetch options with auth header
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all approved reviews (public)
export const getApprovedReviews = async () => {
  const res = await fetch(`${REVIEW_API_URL}/approved`);
  return res.json();
};

// Get reviews for a specific package (public)
export const getPackageReviews = async (packageId) => {
  const res = await fetch(`${REVIEW_API_URL}/package/${packageId}`);
  return res.json();
};

// Get review by ID
export const getReview = async (id) => {
  const res = await fetch(`${REVIEW_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Get current user's reviews
export const getUserReviews = async () => {
  const res = await fetch(`${REVIEW_API_URL}/my-reviews`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Create a new review
export const createReview = async (reviewData) => {
  const res = await fetch(REVIEW_API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData),
  });
  return res.json();
};

// Update review
export const updateReview = async (id, reviewData) => {
  const res = await fetch(`${REVIEW_API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData),
  });
  return res.json();
};

// Delete review
export const deleteReview = async (id) => {
  const res = await fetch(`${REVIEW_API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Admin: Get all reviews
export const getAllReviews = async () => {
  const res = await fetch(REVIEW_API_URL, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Admin: Update review status
export const updateReviewStatus = async (id, status) => {
  const res = await fetch(`${REVIEW_API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};
