import { jest } from "@jest/globals";
let createProduct, getAllProducts, getProductById, updateProduct, deleteProduct;

// Mock Product model
const Product = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

// Patch the Product import in the controller to use our mock

const User = {};
const Booking = {};
const Review = {};
const EquipmentPurchase = {};
const WishlistItem = {};
const ContactMessage = {};
jest.unstable_mockModule("../Model/index.js", () => ({
  Product,
  User,
  Booking,
  Review,
  EquipmentPurchase,
  WishlistItem,
  ContactMessage,
}));

jest.unstable_mockModule("../Utils/pagination.js", () => ({
  parsePagination: () => ({ page: 1, limit: 100 }),
  paginateArray: (arr) => ({ items: arr, meta: {} }),
}));

beforeAll(async () => {
  const controller = await import("../Controller/Product/productController.js");
  createProduct = controller.createProduct;
  getAllProducts = controller.getAllProducts;
  getProductById = controller.getProductById;
  updateProduct = controller.updateProduct;
  deleteProduct = controller.deleteProduct;
});

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Product Controller", () => {
  it("should create a new product", async () => {
    const req = {
      body: {
        name: "Test Product",
        description: "Test Description",
        price: 100,
        stock_quantity: 10,
        warranty_months: 12,
        category_id: 1,
        brand_id: 1,
        image_url: "https://th.bing.com/th/id/OIP.OKrO3TaA5yn0ba-6JAF-YwHaE8?w=257&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
        status: "active",
        category: "electronics",
        duration: "24"
      }
    };
    const res = mockResponse();
    Product.create.mockResolvedValue(req.body);
    await createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Package created successfully",
      product: expect.any(Object)
    });
  });
  it("should return all products", async () => {
    const req = { query: {} };
    const res = mockResponse();
    const products = [{ id: 1, productName: "Test Product" }];
    Product.findAll.mockResolvedValue(products);

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Packages retrieved successfully",
      products: expect.any(Array),
      count: expect.any(Number)
    }));
  });
  it("should return a product by ID", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();
    const product = { id: 1, productName: "Test Product" };
    Product.findByPk.mockResolvedValue(product);

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      price: expect.any(Number),
      formattedPrice: expect.any(String)
    }));
  });
  it("should return 404 if product not found", async () => {
    const req = { params: { id: 2 } };
    const res = mockResponse();
    Product.findByPk.mockResolvedValue(null);

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Package not found" });
  });
  it("should update a product", async () => {
    const req = { params: { id: 1 }, body: { name: "Updated Product", price: 200 } };
    const res = mockResponse();
    Product.update.mockResolvedValue([1]);
    Product.findByPk.mockResolvedValue({ id: 1, name: "Updated Product", price: 200, toJSON: () => ({ id: 1, name: "Updated Product", price: 200 }) });
    await updateProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Package updated successfully",
      product: expect.any(Object)
    });
  });
  it("should return 404 if product to update not found", async () => {
    const req = { params: { id: 2 }, body: { name: "Not Found" } };
    const res = mockResponse();
    Product.update.mockResolvedValue([0]);
    await updateProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Package not found" });
  });
  it("should delete a product", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();
    Product.destroy.mockResolvedValue(1);
    await deleteProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Package deleted successfully" });
  });
  it("should return 404 if product to delete not found", async () => {
    const req = { params: { id: 2 } };
    const res = mockResponse();
    Product.destroy.mockResolvedValue(0);
    await deleteProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Package not found" });
  });
});


