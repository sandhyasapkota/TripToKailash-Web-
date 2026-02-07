import express from 'express';
import {
  createEquipmentPurchase,
  getUserEquipmentPurchases,
  getAllEquipmentPurchases,
  updateEquipmentPurchaseStatus
} from '../../Controller/index.js';
import { verifyToken, isAdmin } from '../../Middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', verifyToken, createEquipmentPurchase);
router.get('/user', verifyToken, getUserEquipmentPurchases);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllEquipmentPurchases);
router.put('/:id/status', verifyToken, isAdmin, updateEquipmentPurchaseStatus);

export { router as EquipmentPurchaseRoutes };
