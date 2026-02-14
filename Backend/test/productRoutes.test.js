import request from "supertest";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sequelize } from "../Database/db.js";
import { User } from "../Model/User/UserModel.js";

dotenv.config({ path: './.env' });
let app;
let token;

beforeAll(async () => {
    app = (await import("../app.js")).default;
    await sequelize.sync({ force: true });
    // Create an admin user for authentication
    await User.create({ id: 1, username: 'admin', email: 'admin@example.com', password: 'admin', role: 'admin', isEmailVerified: true });
    token = jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production-12345", { expiresIn: '1h' });
});

afterAll(async () => {
    await sequelize.close();
});

describe("Product Routes", () => {
    let id;
    it("should create a new product", async () => {
        const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${token}`)
            .send({name: "Test Product", description: "Test Description", price: 100, stock_quantity: 10, warranty_months: 12, category_id: 1, brand_id: 1, image_url: "http://example.com/image.jpg", status: "active", category: "electronics", duration: "24"});
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("product");
        id = res.body.product.id;
    });

    it("should get all products", async () => {
        const res = await request(app).get("/products");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("products");
        expect(Array.isArray(res.body.products)).toBe(true);
    });
    it("should get a product by ID", async () => {
        const res = await request(app).get(`/products/${id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("id");
        expect(res.body.id).toBe(id);
    });
    it('should update a product', async () => {
        const res = await request(app)
            .put(`/products/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({name: "Updated Product", price: 150});
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("product");
        expect(res.body.product.name).toBe("Updated Product");
        expect(res.body.product.price).toBe(150);
    });
    it('should delete a product', async () => {
        const res = await request(app)
            .delete(`/products/${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message", "Package deleted successfully");
    });
    
});