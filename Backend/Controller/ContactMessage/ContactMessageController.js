import { ContactMessage } from '../../Model/ContactMessage/ContactMessageModel.js';
import { Op } from 'sequelize';

// Create a new contact message
export const createContactMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Get userId from token if user is logged in
        const userId = req.user?.id || null;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
        }

        const newMessage = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message,
            status: 'unread',
            userId
        });

        return res.status(201).json({
            message: 'Your message has been sent successfully! We will contact you soon.',
            data: newMessage
        });
    } catch (error) {
        console.error('Error creating contact message:', error);
        return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
};

// Get all contact messages (Admin)
export const getAllContactMessages = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const { count, rows: messages } = await ContactMessage.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json({
            message: 'Contact messages retrieved successfully',
            data: messages,
            pagination: {
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages.' });
    }
};

// Get single contact message
export const getContactMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await ContactMessage.findByPk(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        // Mark as read if unread
        if (message.status === 'unread') {
            message.status = 'read';
            await message.save();
        }

        return res.status(200).json({
            message: 'Message retrieved successfully',
            data: message
        });
    } catch (error) {
        console.error('Error fetching message:', error);
        return res.status(500).json({ error: 'Failed to fetch message.' });
    }
};

// Update contact message status (Admin)
export const updateContactMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, adminReply } = req.body;

        const message = await ContactMessage.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        if (status) message.status = status;
        if (adminNotes !== undefined) message.adminNotes = adminNotes;
        if (adminReply !== undefined) {
            message.adminReply = adminReply;
            message.repliedAt = new Date();
            message.status = 'replied';
        }
        await message.save();

        return res.status(200).json({
            message: 'Message updated successfully',
            data: message
        });
    } catch (error) {
        console.error('Error updating message:', error);
        return res.status(500).json({ error: 'Failed to update message.' });
    }
};

// Delete contact message (Admin)
export const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await ContactMessage.findByPk(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        await message.destroy();
        return res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ error: 'Failed to delete message.' });
    }
};

// Get unread count (Admin)
export const getUnreadCount = async (req, res) => {
    try {
        const count = await ContactMessage.count({ where: { status: 'unread' } });
        return res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        return res.status(500).json({ error: 'Failed to get unread count.' });
    }
};

// Get user's messages by email or userId (for checking replies)
export const getUserMessages = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const userId = req.user.id;

        // Find messages by userId OR email
        const messages = await ContactMessage.findAll({
            where: {
                [Op.or]: [
                    { userId: userId },
                    { email: userEmail }
                ]
            },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'subject', 'message', 'status', 'adminReply', 'repliedAt', 'createdAt']
        });

        return res.status(200).json({
            message: 'Messages retrieved successfully',
            data: messages
        });
    } catch (error) {
        console.error('Error fetching user messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages.' });
    }
};
