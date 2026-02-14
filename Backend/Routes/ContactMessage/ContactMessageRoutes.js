import express from 'express';
import {
    createContactMessage,
    getAllContactMessages,
    getContactMessageById,
    updateContactMessageStatus,
    deleteContactMessage,
    getUnreadCount,
    getUserMessages
} from '../../Controller/ContactMessage/ContactMessageController.js';
import { verifyToken, isAdmin, optionalAuth } from '../../Middleware/authMiddleware.js';

const router = express.Router();

// Public route - submit contact form (with optional auth to link userId)
router.post('/', optionalAuth, createContactMessage);

// User route - get their own messages/replies
router.get('/my-messages', verifyToken, getUserMessages);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllContactMessages);
router.get('/unread-count', verifyToken, isAdmin, getUnreadCount);
router.get('/:id', verifyToken, isAdmin, getContactMessageById);
router.put('/:id', verifyToken, isAdmin, updateContactMessageStatus);
router.delete('/:id', verifyToken, isAdmin, deleteContactMessage);

export default router;
