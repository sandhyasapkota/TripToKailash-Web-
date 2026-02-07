import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getAllUsers, 
  updateUserById, 
  deleteUserById, 
  createUser, 
  getUserById, 
  registerUser, 
  loginUser,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  verifyTokenEndpoint,
  verifyEmail,
  resendVerificationEmail
} from '../../Controller/index.js';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';

// Configure multer for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'profile-pictures');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Auth routes (public)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-token', verifyTokenEndpoint);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllUsers);
router.post('/', verifyToken, isAdmin, createUser);
router.delete('/:id', verifyToken, isAdmin, deleteUserById);

// User routes (protected)
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUserById);
router.put('/:id/profile-picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);

export {router as UserRoute};
