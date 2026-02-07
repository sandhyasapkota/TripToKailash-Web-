import { DataTypes } from 'sequelize';
import { sequelize } from '../../Database/db.js';

const WishlistItem = sequelize.define('WishlistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'wishlists',
  timestamps: false
});

// Setup associations - will be called after all models are loaded
WishlistItem.associate = (models) => {
  WishlistItem.belongsTo(models.Product, { foreignKey: 'product_id' });
  WishlistItem.belongsTo(models.User, { foreignKey: 'user_id' });
};

export { WishlistItem };
