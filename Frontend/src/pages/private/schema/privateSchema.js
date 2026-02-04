// Zod schema for private pages (example: user profile)
import { z } from 'zod';

// User Profile Schema
export const userProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
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
      'Please enter a valid phone number (10 digits or with country code)'),
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

// Booking Schema
export const bookingSchema = z.object({
  productId: z
    .number({ required_error: 'Package ID is required', invalid_type_error: 'Package ID must be a number' })
    .int('Package ID must be a valid number')
    .positive('Package ID must be positive'),
  travelDate: z
    .string()
    .min(1, 'Travel date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Travel date must be in the future'),
  numberOfPeople: z
    .number({ required_error: 'Number of people is required', invalid_type_error: 'Number of people must be a number' })
    .int('Number of people must be a whole number')
    .min(1, 'At least 1 person is required')
    .max(20, 'Maximum 20 people allowed per booking'),
  specialRequests: z
    .string()
    .max(500, 'Special requests must be less than 500 characters')
    .optional()
    .default(''),
});

// Review Schema
export const reviewSchema = z.object({
  rating: z
    .number({ required_error: 'Rating is required', invalid_type_error: 'Rating must be a number' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  title: z
    .string()
    .min(1, 'Review title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  comment: z
    .string()
    .min(1, 'Review comment is required')
    .min(20, 'Comment must be at least 20 characters')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
});

// Equipment Purchase Schema
export const equipmentPurchaseSchema = z.object({
  productId: z
    .number({ required_error: 'Product ID is required', invalid_type_error: 'Product ID must be a number' })
    .int('Product ID must be a valid number')
    .positive('Product ID must be positive'),
  quantity: z
    .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Minimum quantity is 1')
    .max(100, 'Maximum quantity is 100'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\d{10}|(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})$/, 
      'Please enter a valid phone number (10 digits or with country code)'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
    .trim(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .default('')
});

// Admin Package Schema
export const packageSchema = z.object({
  name: z
    .string()
    .min(1, 'Package name is required')
    .min(5, 'Name must be at least 5 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .positive('Price must be a positive number')
    .min(100, 'Price must be at least 100'),
  duration: z
    .string()
    .min(1, 'Duration is required')
    .regex(/^\d+\s*(days?|nights?|weeks?)/i, 'Duration format should be like "10 days" or "2 weeks"'),
  category: z
    .string()
    .min(1, 'Category is required'),
  stock_quantity: z
    .number({ required_error: 'Available slots is required', invalid_type_error: 'Slots must be a number' })
    .int('Slots must be a whole number')
    .min(0, 'Slots cannot be negative')
    .max(1000, 'Maximum 1000 slots allowed'),
  image_url: z
    .string()
    .url('Please enter a valid image URL')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['active', 'inactive'], { 
      errorMap: () => ({ message: 'Status must be either active or inactive' }) 
    }),
});
