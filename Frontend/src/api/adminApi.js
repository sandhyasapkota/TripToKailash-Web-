// src/api/adminApi.js
export const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5000/api/admin';

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

// Dashboard Statistics
export const getDashboardStats = async () => {
  const res = await fetch(`${ADMIN_API_URL}/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// User Management
export const getAllUsers = async () => {
  const res = await fetch(`${ADMIN_API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getUserById = async (id) => {
  const res = await fetch(`${ADMIN_API_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const updateUser = async (id, userData) => {
  const res = await fetch(`${ADMIN_API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${ADMIN_API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Package Management
export const getAllPackages = async () => {
  const res = await fetch(`${ADMIN_API_URL}/packages`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createPackage = async (packageData) => {
  const res = await fetch(`${ADMIN_API_URL}/packages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(packageData),
  });
  return res.json();
};

export const updatePackage = async (id, packageData) => {
  const res = await fetch(`${ADMIN_API_URL}/packages/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(packageData),
  });
  return res.json();
};

export const deletePackage = async (id) => {
  const res = await fetch(`${ADMIN_API_URL}/packages/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Booking Management
export const getAllBookings = async () => {
  const res = await fetch(`${ADMIN_API_URL}/bookings`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${ADMIN_API_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const deleteBooking = async (id) => {
  const res = await fetch(`${ADMIN_API_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Review Management
export const getAllReviews = async () => {
  const res = await fetch(`${ADMIN_API_URL}/reviews`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const updateReviewStatus = async (id, status) => {
  const res = await fetch(`${ADMIN_API_URL}/reviews/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const deleteReview = async (id) => {
  const res = await fetch(`${ADMIN_API_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Reports
export const getBookingReport = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await fetch(`${ADMIN_API_URL}/reports/bookings?${params}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getRevenueReport = async (period = 'monthly') => {
  const res = await fetch(`${ADMIN_API_URL}/reports/revenue?period=${period}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};
