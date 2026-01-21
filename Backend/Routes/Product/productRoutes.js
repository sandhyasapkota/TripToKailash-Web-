import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../../Controller/index.js';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view packages
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes - require admin authentication
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export { router as productRoute }; 