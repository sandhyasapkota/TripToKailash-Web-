// src/api/productApi.js
export const PRODUCT_API_URL = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:5000/api/products';

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

// Get all products/packages (public)
export const getAllProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const url = queryString ? `${PRODUCT_API_URL}?${queryString}` : PRODUCT_API_URL;
  
  const res = await fetch(url);
  return res.json();
};

// Get product/package by ID (public)
export const getProduct = async (id) => {
  const res = await fetch(`${PRODUCT_API_URL}/${id}`);
  return res.json();
};

// Admin: Create a new product/package
export const createProduct = async (productData) => {
  const res = await fetch(PRODUCT_API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  return res.json();
};

// Admin: Update product/package
export const updateProduct = async (id, productData) => {
  const res = await fetch(`${PRODUCT_API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  return res.json();
};

// Admin: Delete product/package
export const deleteProduct = async (id) => {
  const res = await fetch(`${PRODUCT_API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Get products by category
export const getProductsByCategory = async (category) => {
  const res = await fetch(`${PRODUCT_API_URL}?category=${encodeURIComponent(category)}`);
  return res.json();
};

// Get active products only
export const getActiveProducts = async () => {
  const res = await fetch(`${PRODUCT_API_URL}?status=active`);
  return res.json();
};

// Get featured products (you can define what makes a product featured)
export const getFeaturedProducts = async (limit = 4) => {
  const res = await fetch(`${PRODUCT_API_URL}?status=active&limit=${limit}`);
  return res.json();
};
