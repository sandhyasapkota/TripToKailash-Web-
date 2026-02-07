import { DataTypes } from 'sequelize';
import { sequelize } from '../../Database/db.js';

export const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  packageName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  travelDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  equipmentItems: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('equipmentItems');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('equipmentItems', value ? JSON.stringify(value) : null);
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});
