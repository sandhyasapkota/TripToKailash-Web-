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
  verifyTokenEndpoint
} from '../../Controller/index.js';

// Configure multer for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), '..', 'uploads', 'profile-pictures');
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

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-token', verifyTokenEndpoint);

// CRUD routes
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.put('/:id/profile-picture', upload.single('profilePicture'), uploadProfilePicture);
router.delete('/:id', deleteUserById);

export {router as UserRoute};