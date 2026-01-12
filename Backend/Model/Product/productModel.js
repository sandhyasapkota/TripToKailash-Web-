import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    duration: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "10 days",
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Adventure",
    },

    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },

    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

export { Product };
