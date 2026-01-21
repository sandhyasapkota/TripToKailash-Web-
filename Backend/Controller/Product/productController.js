import { Product } from "../../Model/index.js";

// Helper function to format product with price
const formatProduct = (product) => {
  const data = product.toJSON ? product.toJSON() : product;
  return {
    ...data,
    price: parseFloat(data.price) || 0,
    formattedPrice: `Nrs. ${parseFloat(data.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  };
};

const createProduct = async (req, res) => {
  try {
    const body = req.body;
    
    // Validation
    if (!body.name || body.name.trim().length < 3) {
      return res.status(400).json({ error: "Name is required and must be at least 3 characters" });
    }
    
    if (body.price == null || isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0) {
      return res.status(400).json({ error: "Valid price is required" });
    }

    if (body.duration && body.duration.trim().length === 0) {
      return res.status(400).json({ error: "Duration cannot be empty" });
    }

    if (body.stock_quantity != null && (isNaN(parseInt(body.stock_quantity)) || parseInt(body.stock_quantity) < 0)) {
      return res.status(400).json({ error: "Stock quantity must be a positive number" });
    }

    const newProduct = await Product.create({
      ...body,
      price: parseFloat(body.price),
      stock_quantity: parseInt(body.stock_quantity) || 0,
      status: body.status || 'active'
    });
    
    res.status(201).json({ 
      message: "Package created successfully", 
      product: formatProduct(newProduct)
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: "Failed to create package" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    // Build where clause for filtering
    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    
    const products = await Product.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      order: [['createdAt', 'DESC']]
    });
    
    // Format all products with proper price formatting
    const formattedProducts = products.map(formatProduct);
    
    res.status(200).json({ 
      message: "Packages retrieved successfully", 
      products: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: "Failed to retrieve packages" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Valid package ID is required" });
    }
    
    const product = await Product.findByPk(id);
    
    if (product) {
      res.status(200).json(formatProduct(product));
    } else {
      res.status(404).json({ error: "Package not found" });
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: "Failed to retrieve package" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Valid package ID is required" });
    }

    // Validation
    if (updateData.name !== undefined && updateData.name.trim().length < 3) {
      return res.status(400).json({ error: "Name must be at least 3 characters" });
    }
    
    if (updateData.price !== undefined && (isNaN(parseFloat(updateData.price)) || parseFloat(updateData.price) < 0)) {
      return res.status(400).json({ error: "Valid price is required" });
    }

    if (updateData.stock_quantity !== undefined && (isNaN(parseInt(updateData.stock_quantity)) || parseInt(updateData.stock_quantity) < 0)) {
      return res.status(400).json({ error: "Stock quantity must be a positive number" });
    }

    // Prepare update data
    const dataToUpdate = {};
    const allowedFields = ['name', 'description', 'price', 'stock_quantity', 'category_id', 'brand_id', 'image_url', 'status', 'category', 'duration'];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'price') {
          dataToUpdate[field] = parseFloat(updateData[field]);
        } else if (field === 'stock_quantity') {
          dataToUpdate[field] = parseInt(updateData[field]);
        } else {
          dataToUpdate[field] = updateData[field];
        }
      }
    });

    const [updated] = await Product.update(dataToUpdate, { where: { id } });
    
    if (updated) {
      const updatedProduct = await Product.findByPk(id);
      res.status(200).json({ 
        message: "Package updated successfully", 
        product: formatProduct(updatedProduct)
      });
    } else {
      res.status(404).json({ error: "Package not found" });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: "Failed to update package" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Valid package ID is required" });
    }
    
    const deleted = await Product.destroy({ where: { id } });
    
    if (deleted) {
      res.status(200).json({ message: "Package deleted successfully" });
    } else {
      res.status(404).json({ error: "Package not found" });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: "Failed to delete package" });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};