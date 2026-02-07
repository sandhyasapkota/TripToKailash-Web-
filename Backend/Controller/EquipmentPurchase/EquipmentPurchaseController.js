import { EquipmentPurchase, Product } from '../../Model/index.js';

export const createEquipmentPurchase = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { productId, quantity, phone, address, notes } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 100) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 100' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if ((product.category || '').toLowerCase() !== 'equipment') {
      return res.status(400).json({ error: 'This product is not equipment' });
    }

    if (product.stock_quantity < qty) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const totalPrice = parseFloat(product.price) * qty;

    const purchase = await EquipmentPurchase.create({
      userId,
      userName: req.user.username,
      userEmail: req.user.email,
      productId,
      productName: product.name,
      price: parseFloat(product.price),
      quantity: qty,
      totalPrice,
      phone: phone || req.user.phone || '',
      address: address || '',
      notes: notes || '',
      status: 'Pending'
    });

    await product.update({
      stock_quantity: product.stock_quantity - qty
    });

    res.status(201).json({
      message: 'Purchase request submitted. We will call to confirm.',
      data: purchase
    });
  } catch (error) {
    console.error('Create equipment purchase error:', error);
    res.status(500).json({ error: 'Failed to submit purchase request' });
  }
};

export const getUserEquipmentPurchases = async (req, res) => {
  try {
    const userId = req.user?.id;
    const purchases = await EquipmentPurchase.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: purchases });
  } catch (error) {
    console.error('Get user equipment purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
};

export const getAllEquipmentPurchases = async (req, res) => {
  try {
    const purchases = await EquipmentPurchase.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: purchases });
  } catch (error) {
    console.error('Get all equipment purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
};

export const updateEquipmentPurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const purchase = await EquipmentPurchase.findByPk(id);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    await purchase.update({ status });
    res.status(200).json({ message: 'Status updated', data: purchase });
  } catch (error) {
    console.error('Update equipment purchase status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};
