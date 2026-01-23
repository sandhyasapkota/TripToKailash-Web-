// src/api/userApi.js
export const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:5000/api/users';

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

// User Registration
export const registerUser = async (userData) => {
  const res = await fetch(`${USER_API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
};

// User Login
export const loginUser = async (credentials) => {
  const res = await fetch(`${USER_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return res.json();
};

// Email Verification
export const verifyEmail = async (token) => {
  const res = await fetch(`${USER_API_URL}/verify-email?token=${token}`);
  return res.json();
};

// Resend Verification Email
export const resendVerificationEmail = async (email) => {
  const res = await fetch(`${USER_API_URL}/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

// Forgot Password
export const forgotPassword = async (email) => {
  const res = await fetch(`${USER_API_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

// Reset Password
export const resetPassword = async (token, password) => {
  const res = await fetch(`${USER_API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  return res.json();
};

// Get Current User Profile
export const getCurrentUser = async () => {
  const res = await fetch(`${USER_API_URL}/profile`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Get User by ID
export const getUser = async (id) => {
  const res = await fetch(`${USER_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Update User Profile
export const updateUserProfile = async (userData) => {
  const res = await fetch(`${USER_API_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return res.json();
};

// Update User Profile with FormData (for file uploads)
export const updateUserProfileWithFile = async (formData) => {
  const token = getAuthToken();
  const res = await fetch(`${USER_API_URL}/profile`, {
    method: 'PUT',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  return res.json();
};

// Change Password
export const changePassword = async (passwordData) => {
  const res = await fetch(`${USER_API_URL}/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData),
  });
  return res.json();
};

// Delete Account
export const deleteAccount = async () => {
  const res = await fetch(`${USER_API_URL}/profile`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};
