import request from "supertest";
let app;

beforeAll(async () => {
	app = (await import('../app.js')).default;
});

describe('Security Tests', () => {
       // Product security
       it('should prevent SQL Injection on product creation', async () => {
	       const res = await request(app)
		       .post('/products')
		       .send({ name: "' OR 1=1 -- ", price: 99.99, description: 'Hacked' });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should prevent XSS attacks on product creation', async () => {
	       const res = await request(app)
		       .post('/products')
		       .send({ name: "<script>alert('XSS')</script>", price: 99.99, description: 'XSS Test' });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should return 404 for unknown product route', async () => {
	       const res = await request(app).get('/products/unknown');
	       expect([404, 400, 401]).toContain(res.statusCode);
       });

       // Booking security
       it('should prevent SQL Injection on booking creation', async () => {
	       const res = await request(app)
		       .post('/bookings')
		       .send({ userId: "' OR 1=1 -- ", productId: 1, startDate: "2026-02-01", endDate: "2026-02-10" });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should prevent XSS attacks on booking creation', async () => {
	       const res = await request(app)
		       .post('/bookings')
		       .send({ userId: 1, productId: 1, startDate: "<script>alert('XSS')</script>", endDate: "2026-02-10" });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should return 404 for unknown booking route', async () => {
	       const res = await request(app).get('/bookings/unknown');
	       expect([404, 400, 401]).toContain(res.statusCode);
       });

       // User security
       it('should prevent SQL Injection on user registration', async () => {
	       const res = await request(app)
		       .post('/users/register')
		       .send({ fullName: "Sandhya' OR 1=1 -- ", email: "sapkotasandhya160@gmail.com", phone: "1234567890", password: "testpass" });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should prevent XSS attacks on user registration', async () => {
	       const res = await request(app)
		       .post('/users/register')
		       .send({ fullName: "<script>alert('XSS')</script>", email: "sapkotasandhya160@gmail.com", phone: "1234567890", password: "testpass" });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should return 404 for unknown user route', async () => {
	       const res = await request(app).get('/users/unknown');
	       expect([404, 400, 401]).toContain(res.statusCode);
       });

       // Review security
       it('should prevent SQL Injection on review creation', async () => {
	       const res = await request(app)
		       .post('/reviews')
		       .send({ user_id: "' OR 1=1 -- ", product_id: 1, rating: 5, title: 'Test', comment: 'Hacked' });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should prevent XSS attacks on review creation', async () => {
	       const res = await request(app)
		       .post('/reviews')
		       .send({ user_id: 1, product_id: 1, rating: 5, title: "<script>alert('XSS')</script>", comment: 'XSS Test' });
	       expect([400, 401, 403]).toContain(res.statusCode);
       });

       it('should return 404 for unknown review route', async () => {
	       const res = await request(app).get('/reviews/unknown');
	       expect([404, 400, 401]).toContain(res.statusCode);
       });
});