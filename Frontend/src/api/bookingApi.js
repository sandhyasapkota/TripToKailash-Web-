// src/api/bookingApi.js
export const BOOKING_API_URL = import.meta.env.VITE_BOOKING_API_URL || 'http://localhost:5000/api/bookings';

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

// Get all user's bookings
export const getUserBookings = async () => {
  const res = await fetch(`${BOOKING_API_URL}/my-bookings`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Get booking by ID
export const getBooking = async (id) => {
  const res = await fetch(`${BOOKING_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Create a new booking
export const createBooking = async (bookingData) => {
  const res = await fetch(BOOKING_API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });
  return res.json();
};

// Update booking
export const updateBooking = async (id, bookingData) => {
  const res = await fetch(`${BOOKING_API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });
  return res.json();
};

// Cancel booking
export const cancelBooking = async (id) => {
  const res = await fetch(`${BOOKING_API_URL}/${id}/cancel`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Delete booking
export const deleteBooking = async (id) => {
  const res = await fetch(`${BOOKING_API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Admin: Get all bookings
export const getAllBookings = async () => {
  const res = await fetch(BOOKING_API_URL, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Admin: Update booking status
export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${BOOKING_API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};
