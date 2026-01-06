import express from 'express';
import { 
  getAllUsers, 
  updateUserById, 
  deleteUserById, 
  createUser, 
  getUserById, 
  registerUser, 
  loginUser,
  forgotPassword,
  resetPassword
} from '../../Controller/index.js';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// CRUD routes
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);

export {router as UserRoute};