import { Product } from "../../Model/index.js";
import { parsePagination, paginateArray } from "../../Utils/pagination.js";

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
    const { status, category, duration, q, minPrice, maxPrice, sortBy, sortDir } = req.query;
    const { page, limit } = parsePagination(req.query);

    const products = await Product.findAll({
      order: [['createdAt', 'DESC']]
    });

    let formattedProducts = products.map(formatProduct);

    if (status) {
      formattedProducts = formattedProducts.filter((p) => p.status === status);
    }

    if (category) {
      formattedProducts = formattedProducts.filter((p) => p.category === category);
    }

    if (duration) {
      formattedProducts = formattedProducts.filter((p) => p.duration === duration);
    }

    if (q && q.trim().length > 0) {
      const query = q.trim().toLowerCase();
      formattedProducts = formattedProducts.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        const productCategory = (p.category || '').toLowerCase();
        return name.includes(query) || description.includes(query) || productCategory.includes(query);
      });
    }

    if (minPrice !== undefined && !isNaN(parseFloat(minPrice))) {
      const min = parseFloat(minPrice);
      formattedProducts = formattedProducts.filter((p) => parseFloat(p.price) >= min);
    }

    if (maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) {
      const max = parseFloat(maxPrice);
      formattedProducts = formattedProducts.filter((p) => parseFloat(p.price) <= max);
    }

    const allowedSortFields = ['createdAt', 'price', 'name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortDir === 'asc' ? 1 : -1;

    formattedProducts.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1 * sortDirection;
      if (bValue == null) return -1 * sortDirection;
      if (sortField === 'name') {
        return String(aValue).localeCompare(String(bValue)) * sortDirection;
      }
      if (sortField === 'price') {
        return (parseFloat(aValue) - parseFloat(bValue)) * sortDirection;
      }
      return (new Date(aValue).getTime() - new Date(bValue).getTime()) * sortDirection;
    });
    
    const { items, meta } = paginateArray(formattedProducts, page, limit);
    
    res.status(200).json({ 
      message: "Packages retrieved successfully", 
      products: items,
      count: items.length,
      meta
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: "Failed to retrieve packages" });
  }
};

const getProductCategories = async (req, res) => {
  try {
    const products = await Product.findAll();
    const categories = [];
    for (const product of products) {
      if (product.category && !categories.includes(product.category)) {
        categories.push(product.category);
      }
    }
    categories.sort();

    res.status(200).json({
      message: "Categories retrieved successfully",
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: "Failed to retrieve categories" });
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

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    return res.status(200).json({
      message: "Image uploaded successfully",
      filename: req.file.filename,
      image_url: `/uploads/product-images/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload product image error:', error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductCategories,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
