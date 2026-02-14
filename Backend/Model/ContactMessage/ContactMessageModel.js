import { DataTypes } from 'sequelize';
import { sequelize } from '../../Database/db.js';

export const ContactMessage = sequelize.define('ContactMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for non-logged in users
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('unread', 'read', 'replied'),
        defaultValue: 'unread'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    adminReply: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    repliedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'contact_messages',
    timestamps: true
});
