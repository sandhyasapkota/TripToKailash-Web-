# TripToKailash Backend

This backend exposes REST APIs for users, packages, bookings, and reviews.

## Base URL

`http://localhost:5000`

## Health

`GET /`  
Returns API status, timestamp, and uptime.

## Common Query Parameters

- `page` (default 1)
- `limit` (default 10, max 50)

Pagination metadata is returned as `meta` in responses that support it.

## Products

- `GET /api/products`
  - Filters: `status`, `category`, `duration`, `q`, `minPrice`, `maxPrice`
  - Sort: `sortBy` (`createdAt|price|name`), `sortDir` (`asc|desc`)
- `GET /api/products/categories`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

## Bookings

- `GET /api/bookings` (admin)
  - Filters: `status`, `userId`, `productId`
- `GET /api/bookings/user` (auth user)
  - Filter: `status`
- `GET /api/bookings/availability?productId=1&travelDate=2026-02-20&numberOfPeople=2`
- `POST /api/bookings` (auth user)
- `PUT /api/bookings/:id` (admin) — update status
- `PUT /api/bookings/:id/cancel` (auth user)
- `PUT /api/bookings/:id/reschedule` (auth user)
- `DELETE /api/bookings/:id` (admin)

## Reviews

- `GET /api/reviews` (admin)
  - Filters: `status`, `userId`, `productId`
- `GET /api/reviews/approved`
- `GET /api/reviews/user` (auth user)
- `POST /api/reviews` (auth user)  
  Requires a confirmed or completed booking for the package.
- `PUT /api/reviews/:id` (admin)
- `DELETE /api/reviews/:id` (admin)

## Users

- `GET /api/users` (admin)
  - Filters: `role`, `email`
- `POST /api/users` (admin)
- `GET /api/users/:id` (auth user)
- `PUT /api/users/:id` (auth user)
- `DELETE /api/users/:id` (admin)

## Rate Limiting

Basic in-memory rate limiter is enabled for all requests.
Default: 120 requests per 15 minutes per IP.
