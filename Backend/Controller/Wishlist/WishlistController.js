import { WishlistItem } from '../../Model/Wishlist/WishlistModel.js';
import { User } from '../../Model/index.js';
import { Product } from '../../Model/index.js';

// Set up associations
WishlistItem.belongsTo(Product, { foreignKey: 'product_id' });
WishlistItem.belongsTo(User, { foreignKey: 'user_id' });

export const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await WishlistItem.findOne({
      where: { user_id, product_id }
    });

    if (existing) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await WishlistItem.create({
      user_id,
      product_id
    });

    res.status(201).json({
      message: 'Added to wishlist successfully',
      data: wishlistItem
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    const result = await WishlistItem.destroy({
      where: { user_id, product_id }
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.status(200).json({ message: 'Removed from wishlist successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;

    const wishlist = await WishlistItem.findAll({
      where: { user_id },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'description', 'image_url', 'category', 'duration']
        }
      ],
      order: [['added_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Wishlist retrieved successfully',
      data: wishlist,
      count: wishlist.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving wishlist',
      error: error.message
    });
  }
};

export const checkInWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    const item = await WishlistItem.findOne({
      where: { user_id, product_id }
    });

    res.status(200).json({
      isInWishlist: !!item
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error checking wishlist',
      error: error.message
    });
  }
};
