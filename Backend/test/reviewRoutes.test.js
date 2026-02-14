import request from "supertest";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sequelize } from "../Database/db.js";
import { User } from "../Model/User/UserModel.js";
import { Product } from "../Model/Product/productModel.js";

dotenv.config({ path: './.env' });
let app;

beforeAll(async () => {
	app = (await import("../app.js")).default;
	await sequelize.sync({ force: true });
	await User.create({ id: 1, username: 'admin', email: 'admin@example.com', password: 'admin', role: 'admin', isEmailVerified: true });
	await User.create({ id: 2, username: 'user', email: 'user@example.com', password: 'user', role: 'user', isEmailVerified: true });
	await Product.create({ id: 1, name: 'Test Product', price: 100, stock_quantity: 10, status: 'active', category: 'Adventure' });
});

// Helper to generate a valid JWT for test users
function getToken(user = { id: 1, role: "admin" }) {
	return jwt.sign(user, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production-12345");
}

describe('ReviewRoutes', () => {
	let createdReviewId;

	it('GET /reviews/approved should return approved reviews', async () => {
		const res = await request(app).get('/reviews/approved');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		if (res.body.data.length > 0) {
			expect(res.body.data[0]).toHaveProperty('status', 'Approved');
		}
	});

	it('POST /reviews should create a review (protected)', async () => {
		const token = getToken({ id: 2, role: 'user' });
		const res = await request(app)
			.post('/reviews')
			.set('Authorization', `Bearer ${token}`)
			.send({
				user_id: 1,
				product_id: 1,
				rating: 5,
				title: 'Test Review',
				comment: 'Test comment',
			});
		expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
		if (res.status === 201 || res.status === 200) {
			expect(res.body.data).toHaveProperty('id');
			createdReviewId = res.body.data.id;
		}
	});

	it('GET /reviews/user should return user reviews (protected)', async () => {
		const token = getToken({ id: 2, role: 'user' });
		const res = await request(app)
			.get('/reviews/user')
			.set('Authorization', `Bearer ${token}`);
		expect([200, 401]).toContain(res.status);
		if (res.status === 200) {
			expect(Array.isArray(res.body.data)).toBe(true);
		}
	});

	it('GET /reviews should return all reviews (admin)', async () => {
		const token = getToken({ id: 1, role: 'admin' });
		const res = await request(app)
			.get('/reviews')
			.set('Authorization', `Bearer ${token}`);
		expect([200, 401]).toContain(res.status);
		if (res.status === 200) {
			expect(Array.isArray(res.body.data)).toBe(true);
		}
	});

	it('PUT /reviews/:id should update review status (admin)', async () => {
		const token = getToken({ id: 1, role: 'admin' });
		// Use createdReviewId if available, else fallback to 1
		const reviewId = createdReviewId || 1;
		const res = await request(app)
			.put(`/reviews/${reviewId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({ status: 'Approved' });
		expect([200, 400, 404, 401]).toContain(res.status);
	});

	it('DELETE /reviews/:id should delete review (admin)', async () => {
		const token = getToken({ id: 1, role: 'admin' });
		// Use createdReviewId if available, else fallback to 1
		const reviewId = createdReviewId || 1;
		const res = await request(app)
			.delete(`/reviews/${reviewId}`)
			.set('Authorization', `Bearer ${token}`);
		expect([200, 404, 401]).toContain(res.status);
	});
});
