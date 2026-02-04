import { z } from 'zod';

// Package Schema for Admin Panel
export const packageSchema = z.object({
  name: z
    .string()
    .min(1, 'Package name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Price is required', invalid_type_error: 'Price must be a valid number' })
      .positive('Price must be a positive number')
      .min(1, 'Price must be at least 1')
  ),
  duration: z
    .string()
    .min(1, 'Duration is required')
    .min(2, 'Duration must be at least 2 characters')
    .max(50, 'Duration must be less than 50 characters'),
  category: z
    .string()
    .min(1, 'Category is required')
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters'),
  stock_quantity: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Stock quantity is required', invalid_type_error: 'Stock must be a valid number' })
      .int('Stock must be a whole number')
      .min(0, 'Stock must be 0 or more')
      .max(10000, 'Stock cannot exceed 10,000')
  ),
  image_url: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true;
      // Allow URLs starting with http/https or local paths starting with /uploads
      return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads');
    }, 'Please enter a valid image URL or upload an image')
});

// User Schema for Admin Panel
export const userSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\d{10}|(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})$/, 
      'Please enter a valid phone number'),
  role: z
    .enum(['user', 'admin'], { 
      errorMap: () => ({ message: 'Role must be either user or admin' }) 
    }),
});

// Booking Status Update Schema
export const bookingStatusSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'cancelled', 'completed'], { 
      errorMap: () => ({ message: 'Invalid booking status' }) 
    }),
});

// Review Status Update Schema
export const reviewStatusSchema = z.object({
  status: z
    .enum(['pending', 'approved', 'rejected'], { 
      errorMap: () => ({ message: 'Invalid review status' }) 
    }),
});

// Equipment Schema for Admin Panel
export const equipmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Equipment name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Price is required', invalid_type_error: 'Price must be a valid number' })
      .positive('Price must be a positive number')
      .min(1, 'Price must be at least 1')
  ),
  stock: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Stock is required', invalid_type_error: 'Stock must be a valid number' })
      .int('Stock must be a whole number')
      .min(0, 'Stock must be 0 or more')
      .max(10000, 'Stock cannot exceed 10,000')
  ),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  image_url: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true;
      // Allow URLs starting with http/https or local paths starting with /uploads
      return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/uploads');
    }, 'Please enter a valid image URL or upload an image')
});