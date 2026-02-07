import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAllProducts, getProductCategories, getProductById, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../../Controller/index.js';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';

const router = express.Router();

const productImageDir = path.join(process.cwd(), 'uploads', 'product-images');
if (!fs.existsSync(productImageDir)) {
  fs.mkdirSync(productImageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes - anyone can view packages
router.get('/', getAllProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

// Admin routes - require admin authentication
router.post('/upload', verifyToken, isAdmin, upload.single('image'), uploadProductImage);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export const ProductRoutes = router;
