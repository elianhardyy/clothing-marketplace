# E-Commerce API Documentation

This document provides details about all available API endpoints for the E-Commerce platform.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## API Endpoints

### Transaction Services

| Method | Endpoint                                        | Description                                     | Authentication |
| ------ | ----------------------------------------------- | ----------------------------------------------- | -------------- |
| POST   | `/transactions/payment`                         | Create a payment transaction                    | Required       |
| PUT    | `/transactions/{transactionId}/status`          | Update transaction status                       | Required       |
| POST   | `/transactions/refund`                          | Create a refund transaction                     | Required       |
| PUT    | `/transactions/{transactionId}/complete-refund` | Complete a refund transaction                   | Required       |
| GET    | `/transactions/{transactionId}`                 | Get transaction by ID                           | Required       |
| GET    | `/transactions/order/{orderId}`                 | Get all transactions for a specific order       | Required       |
| GET    | `/transactions/user`                            | Get all transactions for the authenticated user | Required       |
| GET    | `/transactions/stats`                           | Get transaction statistics                      | Required       |

### User Services

| Method | Endpoint                 | Description                      | Authentication |
| ------ | ------------------------ | -------------------------------- | -------------- |
| POST   | `/users/signup/merchant` | Register a new user merhcant     | Not Required   |
| POST   | `/users/signup/customer` | Register a new user customer     | Not Required   |
| POST   | `/users/login` `         | Login user and get access token  | Not Required   |
| POST   | `/users/logout` `        | Logout user                      | Not Required   |
| GET    | `/users/profile`         | Get authenticated user's profile | Required       |
| GET    | `/users/exists`          | Check if a user exists by email  | Required       |
| PUT    | `/users/change-password` | Change user password             | Required       |
| PUT    | `/users/profile`         | Update user profile              | Required       |

### Order Services

| Method | Endpoint                    | Description                       | Authentication |
| ------ | --------------------------- | --------------------------------- | -------------- |
| POST   | `/orders`                   | Create a new order                | Required       |
| GET    | `/orders/{orderId}`         | Get order by ID                   | Required       |
| GET    | `/orders`                   | Get all orders (merchant access)  | Required       |
| GET    | `/orders/user`              | Get orders for authenticated user | Required       |
| GET    | `/orders/customers`         | Get merchant customers            | Required       |
| PUT    | `/orders/{orderId}/status`  | Update order status               | Required       |
| POST   | `/orders/{orderId}/payment` | Process payment for an order      | Required       |
| GET    | `/orders/stats`             | Get order statistics              | Required       |

### Product Services

| Method | Endpoint                | Description                          | Authentication |
| ------ | ----------------------- | ------------------------------------ | -------------- |
| GET    | `/products`             | Get all products                     | Required       |
| GET    | `/products/{productId}` | Get product by ID                    | Required       |
| POST   | `/products`             | Create a new product (merchant only) | Required       |
| PUT    | `/products/{productId}` | Update a product (merchant only)     | Required       |
| DELETE | `/products/{productId}` | Delete a product (merchant only)     | Required       |
| GET    | `/products/featured`    | Get featured products                | Not Required   |

## Request and Response Examples

### Create Payment Transaction

**Request:**

```http
POST /api/transactions/payment
Content-Type: application/json
Authorization: Bearer your_jwt_token_here

{
  "orderId": 123,
  "amount": 150.00,
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "cardLastFour": "4242",
    "externalReference": "ch_1234567890",
    "notes": "Payment for order #ORD-123456"
  }
}
```

### Register User

**Request:**

```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "role": "customer"
}
```

### Create Order

**Request:**

```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer your_jwt_token_here

{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ],
  "shippingAddress": "123 Main St",
  "shippingCity": "Austin",
  "shippingState": "TX",
  "shippingZip": "78701",
  "shippingCountry": "USA",
  "paymentMethod": "credit_card"
}
```

### Create Product (Merchant)

**Request:**

```http
POST /api/products
Content-Type: application/json
Authorization: Bearer your_jwt_token_here

{
  "name": "Premium T-Shirt",
  "description": "High-quality cotton t-shirt",
  "price": 29.99,
  "stock": 100,
  "images": ["https://example.com/images/tshirt1.jpg", "https://example.com/images/tshirt2.jpg"],
  "categoryId": 2,
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Black", "White", "Blue"],
  "brand": "Premium Brand"
}
```

## Query Parameters

Many GET endpoints support pagination and filtering:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default varies by endpoint)
- `status`: Filter by status (for orders and transactions)
- `type`: Filter by type (for transactions)
- `startDate`, `endDate`: Date range filters (for statistics endpoints)

## Environment Variables

The collection uses the following variables:

- `baseUrl`: Base URL for the API (default: http://localhost:3000/api)
- `accessToken`: JWT token for authentication
- `transactionId`: Transaction ID for transaction-specific operations
- `orderId`: Order ID for order-specific operations
- `productId`: Product ID for product-specific operations

## YOU CAN READ MORE REQUEST IN FILE `request.json`

## How To Install

- `git clone https://github.com/elianhardyy/clothing-marketplace.git`
- `cd clothing-marketplace`
- `npm install`
- `npm run seed`
- `npm run start:dev`
