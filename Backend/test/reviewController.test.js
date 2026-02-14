// Mock response object
const mockRes = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
};

import { jest } from '@jest/globals';
let ReviewController;

// Mock Review, User, Product models for ESM
const mockReview = {
	findAll: jest.fn(),
	findByPk: jest.fn(),
	create: jest.fn(),
};
const mockUser = { findByPk: jest.fn() };
const mockProduct = { findByPk: jest.fn() };
const mockBooking = { findAll: jest.fn() };

jest.unstable_mockModule("../Model/index.js", () => ({
	Review: mockReview,
	User: mockUser,
	Product: mockProduct,
	Booking: mockBooking,
	EquipmentPurchase: {},
	WishlistItem: {},
	ContactMessage: {},
}));

jest.unstable_mockModule("../Middleware/authMiddleware.js", () => ({
	verifyToken: (req, res, next) => next(),
	isAdmin: (req, res, next) => next(),
	optionalAuth: (req, res, next) => next(),
}));

jest.unstable_mockModule("../Utils/pagination.js", () => ({
	parsePagination: () => ({ page: 1, limit: 100 }),
	paginateArray: (arr) => ({ items: arr, meta: {} }),
}));

jest.unstable_mockModule("../Utils/emailService.js", () => ({
	sendBookingConfirmationEmail: jest.fn(),
	sendPasswordResetEmail: jest.fn(),
	sendEmailVerificationEmail: jest.fn(),
	sendWelcomeEmail: jest.fn(),
}));

beforeAll(async () => {
	ReviewController = await import('../Controller/Review/ReviewController.js');
});

beforeEach(() => {
	jest.clearAllMocks();
});

describe('ReviewController', () => {
	describe('getAllReviews', () => {
		it('should return all reviews', async () => {
			const reviews = [{ id: 1 }];
			mockReview.findAll.mockResolvedValue(reviews);
			const res = mockRes();
			await ReviewController.getAllReviews({ query: {} }, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: reviews, message: expect.any(String) }));
		});
	});

	describe('getApprovedReviews', () => {
		it('should return approved reviews', async () => {
			const reviews = [{ id: 2, status: 'Approved' }];
			mockReview.findAll.mockResolvedValue(reviews);
			const res = mockRes();
			await ReviewController.getApprovedReviews({ query: {} }, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: reviews, message: expect.any(String) }));
		});
	});

	describe('getUserReviews', () => {
		it('should return user reviews', async () => {
			const reviews = [{ id: 3, userId: 5 }];
			mockReview.findAll.mockResolvedValue(reviews);
			const res = mockRes();
			const req = { user: { id: 5 }, query: {} };
			await ReviewController.getUserReviews(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: reviews, message: expect.any(String) }));
		});
	});

	describe('createReview', () => {
		it('should create a review if all fields are valid', async () => {
			const req = {
				user: { id: 1 },
				body: {
					user_id: 1,
					product_id: 2,
					rating: 5,
					title: 'Great trip experience',
					comment: 'This was really an amazing and wonderful experience overall',
				},
			};
			mockUser.findByPk.mockResolvedValue({ id: 1, username: 'TestUser' });
			mockProduct.findByPk.mockResolvedValue({ id: 2, name: 'TestProduct' });
			mockBooking.findAll.mockResolvedValue([{ status: 'Confirmed' }]);
			mockReview.create.mockResolvedValue({ id: 10 });
			const res = mockRes();
			await ReviewController.createReview(req, res);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { id: 10 }, message: expect.any(String) }));
		});

		it('should return 400 if missing fields', async () => {
			const req = { user: { id: 1 }, body: {} };
			const res = mockRes();
			await ReviewController.createReview(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});

		it('should return 404 if user or product not found', async () => {
			const req = {
				user: { id: 1 },
				body: {
					user_id: 1,
					product_id: 2,
					rating: 5,
					title: 'Great trip experience',
					comment: 'This was really an amazing and wonderful experience overall',
				},
			};
			mockUser.findByPk.mockResolvedValue(null);
			mockProduct.findByPk.mockResolvedValue(null);
			const res = mockRes();
			await ReviewController.createReview(req, res);
			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe('updateReviewStatus', () => {
		it('should update review status', async () => {
			const req = { params: { id: 1 }, body: { status: 'Approved' } };
			const review = { update: jest.fn(), id: 1 };
			mockReview.findByPk.mockResolvedValue(review);
			review.update.mockResolvedValue(review);
			const res = mockRes();
			await ReviewController.updateReviewStatus(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: review, message: expect.any(String) }));
		});

		it('should return 400 for invalid status', async () => {
			const req = { params: { id: 1 }, body: { status: 'Invalid' } };
			const res = mockRes();
			await ReviewController.updateReviewStatus(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
		});

		it('should return 404 if review not found', async () => {
			const req = { params: { id: 1 }, body: { status: 'Approved' } };
			mockReview.findByPk.mockResolvedValue(null);
			const res = mockRes();
			await ReviewController.updateReviewStatus(req, res);
			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe('deleteReview', () => {
		it('should delete review', async () => {
			const req = { params: { id: 1 } };
			const review = { destroy: jest.fn() };
			mockReview.findByPk.mockResolvedValue(review);
			review.destroy.mockResolvedValue();
			const res = mockRes();
			await ReviewController.deleteReview(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it('should return 404 if review not found', async () => {
			const req = { params: { id: 1 } };
			mockReview.findByPk.mockResolvedValue(null);
			const res = mockRes();
			await ReviewController.deleteReview(req, res);
			expect(res.status).toHaveBeenCalledWith(404);
		});
	});

	describe('getReviewById', () => {
		it('should return review by id', async () => {
			const req = { params: { id: 1 } };
			const review = { id: 1 };
			mockReview.findByPk.mockResolvedValue(review);
			const res = mockRes();
			await ReviewController.getReviewById(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: review, message: expect.any(String) }));
		});

		it('should return 404 if review not found', async () => {
			const req = { params: { id: 1 } };
			mockReview.findByPk.mockResolvedValue(null);
			const res = mockRes();
			await ReviewController.getReviewById(req, res);
			expect(res.status).toHaveBeenCalledWith(404);
		});
	});
});
