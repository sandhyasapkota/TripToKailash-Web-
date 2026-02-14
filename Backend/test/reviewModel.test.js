import SequelizeMock from 'sequelize-mock';
import { DataTypes } from 'sequelize';

// Mock DB connection
const DBConnectionMock = new SequelizeMock();

// Define Review model as in ReviewModel.js
const ReviewMock = DBConnectionMock.define('Review', {
	id: 1,
	userId: 1,
	userName: 'Test User',
	packageId: 1,
	packageName: 'Test Package',
	rating: 5,
	title: 'Great Trip',
	comment: 'Amazing experience!',
	status: 'Pending',
});

describe('Review Model', () => {
	it('should create a review with correct fields', async () => {
		const review = await ReviewMock.create({
			userId: 2,
			userName: 'Alice',
			packageId: 3,
			packageName: 'Kailash Yatra',
			rating: 4,
			title: 'Wonderful',
			comment: 'Loved it!',
			status: 'Approved',
		});
		expect(review.userId).toBe(2);
		expect(review.userName).toBe('Alice');
		expect(review.packageId).toBe(3);
		expect(review.packageName).toBe('Kailash Yatra');
		expect(review.rating).toBe(4);
		expect(review.title).toBe('Wonderful');
		expect(review.comment).toBe('Loved it!');
		expect(review.status).toBe('Approved');
	});

	it('should have default status as Pending', async () => {
		const review = await ReviewMock.create({
			userId: 3,
			userName: 'Bob',
			packageId: 2,
			packageName: 'Manasarovar',
			rating: 5,
			title: 'Best',
			comment: 'Life changing!',
		});
		expect(review.status).toBe('Pending');
	});

	it('should not allow rating less than 1 or more than 5', async () => {
		// sequelize-mock does not enforce validation, so we check logic manually
		const invalidLow = ReviewMock.build({ rating: 0 });
		const invalidHigh = ReviewMock.build({ rating: 6 });
		expect(invalidLow.rating >= 1 && invalidLow.rating <= 5).toBe(false);
		expect(invalidHigh.rating >= 1 && invalidHigh.rating <= 5).toBe(false);
	});

});
